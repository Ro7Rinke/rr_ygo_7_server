import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { DeckSlotType } from 'src/common/enums/deck-slot-type';

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
  
  @IsEnum(DeckSlotType)
  @IsNotEmpty()
  slot!: DeckSlotType
}

export class DeckCardItemDto {
  @IsInt()
  @IsNotEmpty()
  card_id!: number;

  @IsInt()
  @IsNotEmpty()
  amount!: number;

  @IsEnum(DeckSlotType)
  @IsNotEmpty()
  slot!: DeckSlotType
}

export class SyncDeckDto {
  @IsInt()
  @IsOptional()
  id?: number; // Se enviado, atualiza; se omitido, cria um novo

  @IsInt()
  @IsOptional()
  user_id?: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeckCardItemDto)
  cards!: DeckCardItemDto[];
}