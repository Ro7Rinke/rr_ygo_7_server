import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async signUp(data: any) {
    const userExists = await this.prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { nickname: data.nickname }] }
    });

    if (userExists) {
      throw new ConflictException('Email ou Nickname já em uso');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newPlayerData = {
      nickname: data.nickname,
      email: data.email,
      password: hashedPassword,
      cash: 2000,
      tickets: 5,
      gold_tickets: 5
    }
    return this.prisma.user.create({
      data: newPlayerData
    });
  }

  async login(data: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { email: user.email, sub: user.id, is_admin: user.is_admin };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}