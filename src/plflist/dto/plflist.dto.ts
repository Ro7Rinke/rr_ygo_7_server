import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PLFType } from 'src/common/enums/plf-type.enum';

export class CreatePLFListDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PLFType)
  @IsNotEmpty()
  type!: PLFType;

  @IsInt()
  @IsOptional()
  status?: number;
}

export class UpdatePLFListDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  status?: number;
}

export class AddPLFCardDto {
  @IsInt()
  @IsNotEmpty()
  card_id!: number;

  @IsInt()
  @IsNotEmpty()
  status!: number;

  @IsString()
  @IsNotEmpty()
  status_title!: string;
}