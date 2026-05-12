import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'SECRET_KEY_MUITO_SEGURA', // Em produção, use variáveis de ambiente
        });
    }

    async validate(payload: any) {
        return { 
            userId: payload.sub, 
            email: payload.email,
            is_admin: payload.is_admin
        };
    }
}