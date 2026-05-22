import {
    Injectable,
    BadRequestException,
    InternalServerErrorException,
    HttpException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

@Injectable()
export class GameService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) { }

    private async parseReplay(buffer: Buffer): Promise<any> {
        const pythonPath = this.configService.get<string>('PYTHON_PATH');
        const parserPath = this.configService.get<string>('REPLAY_PARSER_PATH');

        if (!pythonPath || !parserPath) {
            throw new Error('Config do parser Python não encontrada');
        }

        if (!fs.existsSync(parserPath)) {
            throw new Error(`Parser não encontrado em: ${parserPath}`);
        }

        return new Promise((resolve, reject) => {
            const python = spawn(pythonPath, [parserPath]);

            let output = '';
            let error = '';

            python.stdin.write(buffer);
            python.stdin.end();

            python.stdout.on('data', (data) => {
                output += data.toString();
            });

            python.stderr.on('data', (data) => {
                error += data.toString();
            });

            python.on('close', (code) => {
                if (code !== 0) {
                    return reject(new Error(error || 'Erro no parser Python'));
                }

                try {
                    const parsed = JSON.parse(output);
                    resolve(parsed);
                } catch {
                    reject(new Error('Resposta inválida do parser (não é JSON)'));
                }
            });
        });
    }

    private generateDuelId(seed: number[]): string {
        return seed.join('-');
    }

    private async resolvePlayers(players: string[]) {
        const dbUsers = await this.prisma.user.findMany({
            where: {
                nickname: {
                    in: players.filter(p => !p.startsWith('[AI]')),
                },
            },
        });

        const map = new Map(dbUsers.map(u => [u.nickname, u]));

        return players.map(name => {
            if (name.startsWith('[AI]')) {
                return { nickname: name, isAI: true };
            }

            const user = map.get(name);

            if (!user) {
                throw new BadRequestException(`Player não encontrado: ${name}`);
            }

            return { ...user, isAI: false };
        });
    }

    private validateOwnerInMatch(resolvedPlayers: any[], userId: number) {
        const isInMatch = resolvedPlayers.some(
            (p) => !p.isAI && p.id === userId,
        );

        if (!isInMatch) {
            throw new BadRequestException(
                'Você não faz parte deste replay',
            );
        }
    }

    private async checkDuplicate(userId: number, duelId: string) {
        const exists = await this.prisma.game.findFirst({
            where: {
                user_id: userId,
                duel_id: duelId,
            },
        });

        if (exists) {
            throw new BadRequestException('Replay já cadastrado');
        }
    }

    private async validateDeck(userId: number, decks: any[]): Promise<boolean> {
        const userCards = await this.prisma.userCard.findMany({
            where: { user_id: userId },
        });

        const cardMap = new Map(
            userCards.map(c => [c.card_id, c.amount])
        );

        for (const deck of decks) {
            for (const cardId of deck.main) {
                if (!cardMap.has(cardId) || cardMap.get(cardId)! <= 0) {
                    return false;
                }
                cardMap.set(cardId, cardMap.get(cardId)! - 1);
            }
        }

        return true;
    }

    private getResultStatus(parsed: any, userNickname: string): number {
        if (!parsed.winner) return 2;

        if (parsed.winner === 'Draw') return 2;

        return parsed.winner === userNickname ? 1 : 0;
    }

    private isHumanPlayer(
        p: any,
    ): p is { id: number; nickname: string; isAI: boolean } {
        return !p.isAI && 'id' in p;
    }

    async createWithReplay(userId: number, file: Express.Multer.File) {
        const basePath = this.configService.get<string>('FILES_BASE_PATH');

        if (!basePath) {
            throw new InternalServerErrorException('FILES_BASE_PATH não configurado');
        }

        if (!file.originalname.endsWith('.yrpX')) {
            throw new BadRequestException('Arquivo deve ser .yrpX');
        }

        try {
            const parsed = await this.parseReplay(file.buffer);

            if (!parsed || parsed.error) {
                throw new BadRequestException('Replay inválido');
            }

            const duelId = this.generateDuelId(parsed.seed);

            await this.checkDuplicate(userId, duelId);

            const resolvedPlayers = await this.resolvePlayers(parsed.players);

            this.validateOwnerInMatch(resolvedPlayers, userId);

            const hasAI = resolvedPlayers.some(p => p.isAI);

            const deckValid = await this.validateDeck(userId, parsed.decks);

            let status = 2;
            let type = 2;

            if (hasAI) {
                status = 3;
                type = 3;
            }

            if (!deckValid) {
                status = 4;
            }

            const humanPlayers = resolvedPlayers.filter(this.isHumanPlayer);

            const owner = humanPlayers.find(p => p.id === userId);

            if (!owner) {
                throw new InternalServerErrorException('Owner não encontrado');
            }

            const resultStatus = this.getResultStatus(parsed, owner.nickname);

            const game = await this.prisma.game.create({
                data: {
                    user_id: userId,
                    duel_id: duelId,
                    status,
                    type,
                    result_status: resultStatus,
                    has_replay: 1,
                },
            });

            await this.prisma.gamePlayer.createMany({
                data: humanPlayers.map(p => ({
                    game_id: game.id,
                    user_id: p.id,
                })),
            });

            const replayDir = path.join(basePath, String(userId), 'replays');
            fs.mkdirSync(replayDir, { recursive: true });

            const filePath = path.join(replayDir, `${game.id}.yrpX`);
            fs.writeFileSync(filePath, file.buffer);

            return {
                gameId: game.id,
                duelId,
                status,
                resultStatus,
            };

        } catch (error: unknown) {
            console.error(error);

            if (error instanceof HttpException) {
                throw error;
            }

            if (error instanceof Error) {
                throw new InternalServerErrorException(error.message);
            }

            throw new InternalServerErrorException('Erro ao processar replay');
        }
    }
}