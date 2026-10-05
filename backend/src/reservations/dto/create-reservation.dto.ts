import {
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
} from 'class-validator';

import { ReservaEstado } from '@prisma/client';

export class CreateReservationDto {
  @IsString()
  nombreCliente!: string;

  @IsString()
  emailCliente!: string;

  @IsString()
  telefono!: string;

  @IsDateString()
  fechaInicio!: string;

  @IsDateString()
  fechaFin!: string;

  @IsString()
  lugar!: string;

  @IsNumber()
  packageId!: number;

  @IsOptional()
  @IsEnum(ReservaEstado)
  estado?: ReservaEstado;

  @IsArray()
  toppingsIds!: number[];
}
