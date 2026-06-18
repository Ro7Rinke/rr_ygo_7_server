import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import sqlite3 from 'sqlite3';
import { PrismaService } from '../prisma/prisma.service';

const REPO_API = 'https://api.github.com/repos/Ro7Rinke/rr_ygo_7_cdb/contents/cdbs';
const TMP_DIR = path.join(__dirname, '../../tmp');

@Injectable()
export class CardsSyncService {
    constructor(private prisma: PrismaService) { }

    async sync() {
        this.ensureTmp();

        const files = await this.fetchCdbList();

        const master = files.find(f => f.name === 'cards-master.cdb');
        const others = files.filter(f => f.name !== 'cards-master.cdb');

        const masterPath = await this.download(master.download_url);

        const otherDbs: { name: string; path: string }[] = [];
        for (const f of others) {
            const p = await this.download(f.download_url);
            otherDbs.push({ name: f.name, path: p });
        }

        await this.process(masterPath, otherDbs);
        await new Promise(r => setTimeout(r, 2000));
        this.cleanup();

        return { ok: true };
    }

    ensureTmp() {
        if (!fs.existsSync(TMP_DIR)) {
            fs.mkdirSync(TMP_DIR, { recursive: true });
        }
    }

    cleanup() {
        if (fs.existsSync(TMP_DIR)) {
            fs.rmSync(TMP_DIR, { recursive: true, force: true });
        }
    }

    async fetchCdbList() {
        const { data } = await axios.get(REPO_API);
        return data.filter(f => f.name.endsWith('.cdb'));
    }

    async download(url: string) {
        const fileName = path.basename(url);
        const filePath = path.join(TMP_DIR, fileName);

        if (fs.existsSync(filePath)) {
            return filePath;
        }

        const res = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, res.data);

        return filePath;
    }

    openDb(file: string) {
        return new sqlite3.Database(file);
    }

    getAll(db, sql) {
        return new Promise<any[]>((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    hash(obj: any) {
        return crypto
            .createHash('md5')
            .update(JSON.stringify(obj))
            .digest('hex');
    }

    async process(masterPath: string, others: { name: string; path: string }[]) {
        const masterDb = this.openDb(masterPath);

        try {
            const datas = await this.getAll(masterDb, `SELECT * FROM datas`);
            const texts = await this.getAll(masterDb, `SELECT * FROM texts`);

            const textMap = new Map(texts.map(t => [t.id, t]));
            const inGameMap = new Map<number, string>();

            for (const dbFile of others) {
                const db = this.openDb(dbFile.path);

                try {
                    const rows = await this.getAll(db, `SELECT id FROM datas`);

                    for (const r of rows) {
                        if (!inGameMap.has(r.id)) {
                            inGameMap.set(r.id, dbFile.name.replace('.cdb', ''));
                        }
                    }
                } finally {
                    db.close();
                }
            }

            for (const data of datas) {
                const text = textMap.get(data.id) || null;

                const inGame = inGameMap.has(data.id) ? 1 : 0;
                const introducedBy = inGameMap.get(data.id) || null;

                const newHash = this.hash({ data, text, inGame, introducedBy });

                const existing = await this.prisma.cards.findUnique({
                    where: { id: data.id },
                });

                const { id: dataId, ...cleanData } = data;
                const cleanText = text ? (({ id, ...rest }) => rest)(text) : null;

                if (!existing) {
                    await this.prisma.cards.create({
                        data: {
                            id: data.id,
                            status: 0,
                            in_game: inGame,
                            introduced_by: introducedBy,
                            hash: newHash,

                            datas: {
                                create: cleanData,
                            },

                            ...(cleanText && {
                                texts: {
                                    create: cleanText,
                                },
                            }),
                        },
                    });

                    continue;
                }

                if (existing.hash === newHash) continue;

                await this.prisma.cards.update({
                    where: { id: data.id },
                    data: {
                        in_game: inGame,
                        introduced_by: introducedBy,
                        hash: newHash,
                        updated_at: new Date(),

                        datas: {
                            upsert: {
                                where: { id: data.id },
                                create: cleanData,
                                update: cleanData,
                            },
                        },

                        ...(cleanText && {
                            texts: {
                                upsert: {
                                    where: { id: data.id },
                                    create: cleanText,
                                    update: cleanText,
                                },
                            },
                        }),
                    },
                });
            }
        } finally {
            masterDb.close();
        }
    }
}