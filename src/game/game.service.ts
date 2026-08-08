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
import { generateReplayHash } from 'src/common/replays';
import { PLFType } from '@prisma/client';
import { GameStatus, GameType } from 'src/common/enums/game';

interface ReplayDeck {
    main?: number[];
    extra?: number[];
    side?: number[];
}
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
            throw new BadRequestException('Duelo já cadastrado');
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

    private getDeckCardIds(deck: ReplayDeck): number[] {
        return [
            ...(Array.isArray(deck.main) ? deck.main : []),
            ...(Array.isArray(deck.extra) ? deck.extra : []),
            ...(Array.isArray(deck.side) ? deck.side : []),
        ].filter((cardId): cardId is number => Number.isInteger(cardId));
    }

    private async validateDeckLFList(decks: ReplayDeck[]): Promise<boolean> {
        const lfList = await this.prisma.pLFList.findFirst({
            where: {
                status: 1,
                type: 'LF',
            },
            orderBy: {
                id: 'asc',
            },
            include: {
                cards: {
                    select: {
                        card_id: true,
                        status: true,
                    },
                },
            },
        });

        // Sem lista LF ativa: não há restrições para validar.
        if (!lfList) return true;

        const limitsByCardId = new Map(
            lfList.cards.map((card) => [card.card_id, card.status]),
        );

        return decks.every((deck) => {
            const cardCounts = new Map<number, number>();

            this.getDeckCardIds(deck).forEach((cardId) => {
                cardCounts.set(cardId, (cardCounts.get(cardId) ?? 0) + 1);
            });

            for (const [cardId, count] of cardCounts) {
                const status = limitsByCardId.get(cardId);

                // Carta que não consta na BanList: máximo padrão de 3 cópias.
                const limit =
                    status === 0 ? 0 :
                        status === 1 ? 1 :
                            status === 2 ? 2 :
                                3;

                if (count > limit) {
                    return false;
                }
            }

            return true;
        });
    }

    private async validateDeckPowerList(decks: ReplayDeck[]): Promise<boolean> {
        const powerList = await this.prisma.pLFList.findFirst({
            where: {
                status: 1,
                type: 'PW',
            },
            orderBy: {
                id: 'asc',
            },
            include: {
                cards: {
                    select: {
                        card_id: true,
                        status: true,
                    },
                },
            },
        });

        // Sem PowerList ativa: não há restrições para validar.
        if (!powerList) return true;

        const categoryByCardId = new Map(
            powerList.cards.map((card) => [card.card_id, card.status]),
        );

        return decks.every((deck) => {
            // PowerList considera cartas diferentes, não cópias.
            const distinctCardIds = new Set(this.getDeckCardIds(deck));

            let uniqueCards = 0;
            let legendaryCards = 0;
            let epicCards = 0;

            distinctCardIds.forEach((cardId) => {
                const status = categoryByCardId.get(cardId);

                if (status === 1) uniqueCards += 1;
                if (status === 2) legendaryCards += 1;
                if (status === 3) epicCards += 1;
            });

            const uniqueLimit = 1;
            if (uniqueCards > uniqueLimit) return false;

            // Vaga não usada de Única pode ser usada por Lendária.
            const legendaryLimit = 1 + (uniqueLimit - uniqueCards);
            if (legendaryCards > legendaryLimit) return false;

            // Vagas não usadas de Única e Lendária podem ser usadas por Épica.
            const epicLimit =
                2 +
                (uniqueLimit - uniqueCards) +
                (legendaryLimit - legendaryCards);

            if (epicCards > epicLimit) return false;

            return true;
        });
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

    private async checkAndSaveHash(userId: number, hash: string) {
        try {
            await this.prisma.replayHash.create({
                data: {
                    user_id: userId,
                    hash,
                },
            });
        } catch (err) {
            throw new BadRequestException('Replay já enviado');
        }
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
            const replayHash = generateReplayHash(file.buffer);
            await this.checkAndSaveHash(userId, replayHash);

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
            const validLFList = await this.validateDeckLFList(parsed.decks);
            const validPowerList = await this.validateDeckPowerList(parsed.decks);

            let status = GameStatus.VALID
            let type = GameType.RANKED

            if (hasAI) {
                status = GameStatus.AI
                type = GameType.AI
            }

            if(!validLFList)
                status = GameStatus.INVALID_LF

            if(!validPowerList)
                status = GameStatus.INVALID_PW

            if (!deckValid) {
                status = GameStatus.INVALID_DECK
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

            await this.validateAndFinalizeDuel(duelId);

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

    async validateAndFinalizeDuel(duelId: string, ignoreStatus = false) {
        const games = await this.prisma.game.findMany({
            where: { duel_id: duelId },
            include: {
                players: true,
            },
        });

        if (games.length < 2) {
            return;
        }

        const allProcessing = ignoreStatus ? games.every(g => g.status >= 1) : games.every(g => g.status === 2);
        if (!allProcessing) return;

        const basePlayers = games[0].players.map(p => p.user_id).sort();

        const samePlayers = games.every(g => {
            const ids = g.players.map(p => p.user_id).sort();
            return JSON.stringify(ids) === JSON.stringify(basePlayers);
        });

        if (!samePlayers) {
            throw new BadRequestException('Players inconsistentes entre replays');
        }

        const validOwners = games.every(g =>
            basePlayers.includes(g.user_id),
        );

        if (!validOwners) {
            throw new BadRequestException('Owner inválido no match');
        }

        const results = games.map(g => g.result_status);

        const uniqueResults = [...new Set(results)];

        if (!(uniqueResults.length === 1 && uniqueResults[0] === 2)) {
            const hasWin = results.includes(1);
            const hasLose = results.includes(0);

            if (!hasWin || !hasLose) {
                throw new BadRequestException('Resultados inconsistentes');
            }
        }

        for (const game of games) {
            await this.finalizeGame(game.id);
        }
    }

    private async finalizeGame(gameId: number) {
        const game = await this.prisma.game.findUnique({
            where: { id: gameId },
        });

        if (!game) {
            throw new Error('Game não encontrado');
        }

        let cash = 0;
        let rpChange = 0;

        let wins = 0;
        let loses = 0;
        let draws = 0;

        if (game.result_status === 1) {
            cash = 1000;
            rpChange = 5;
            wins = 1;
        } else if (game.result_status === 0) {
            cash = 500;
            rpChange = -2;
            loses = 1;
        } else {
            cash = 750;
            rpChange = 3;
            draws = 1;
        }

        await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: game.user_id },
            });

            if (!user) throw new Error('User não encontrado');

            const newRp = Math.max(0, user.rp + rpChange);

            await tx.user.update({
                where: { id: user.id },
                data: {
                    cash: { increment: cash },
                    rp: newRp,
                    wins: { increment: wins },
                    loses: { increment: loses },
                    draws: { increment: draws },
                },
            });

            await tx.game.update({
                where: { id: game.id },
                data: {
                    status: 1,
                },
            });
        });
    }

    async checkReplayHashes(userId: number, hashes: string[]) {
        const existing = await this.prisma.replayHash.findMany({
            where: {
                user_id: userId,
                hash: { in: hashes },
            },
            select: {
                hash: true,
            },
        });

        const existingSet = new Set(existing.map(h => h.hash));

        return {
            existing: hashes.filter(h => existingSet.has(h)),
            missing: hashes.filter(h => !existingSet.has(h)),
        };
    }
}