import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RarityService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.rarity.findMany({
            select: {
                id: true,
                title: true,
                code: true,
                original_name: true,
                level: true,
            },
        });
    }
}