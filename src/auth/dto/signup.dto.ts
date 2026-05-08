import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: 'O email fornecido é inválido' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  @MaxLength(20, { message: 'A senha deve ter no máximo 20 caracteres' })
  password!: string;

  @IsString()
  @MinLength(3, { message: 'O nickname deve ter no mínimo 3 caracteres' })
  @MaxLength(15, { message: 'O nickname deve ter no máximo 15 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, { 
    message: 'O nickname pode conter apenas letras, números e underline' 
  })
  nickname!: string;
}