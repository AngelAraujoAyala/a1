import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateToppingDto {
  @IsString()
  nombre!: string;

  @IsString()
  @IsOptional()
  iconURL?: string;

  @IsBoolean()
  @IsOptional()
  stock?: boolean;
}
