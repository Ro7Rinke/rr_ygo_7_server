import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RarityService } from "./rarity.service";

@Controller('rarity')
export class RarityController {
    constructor(private rarityService: RarityService) { }

    @UseGuards(JwtAuthGuard)
    @Get("all")
    findAll() {
        return this.rarityService.findAll();
    }
}