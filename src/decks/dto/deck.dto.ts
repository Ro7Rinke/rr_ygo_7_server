import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateUserDeckDto {
  @IsInt()
  @IsNotEmpty()
  user_id!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;
}

export class UpdateUserDeckDto {
  @IsString()
  @IsOptional()
  title?: string;
}

export class AddDeckCardDto {
  @IsInt()
  @IsNotEmpty()
  card_id!: number;

  @IsInt()
  @IsNotEmpty()
  amount!: number;
}

export class DeckCardItemDto {
  @IsInt()
  @IsNotEmpty()
  card_id!: number;

  @IsInt()
  @IsNotEmpty()
  amount!: number;
}

export class SyncDeckDto {
  @IsInt()
  @IsOptional()
  id?: number; // Se enviado, atualiza; se omitido, cria um novo

  @IsInt()
  @IsNotEmpty()
  user_id?: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeckCardItemDto)
  cards!: DeckCardItemDto[];
}