import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  private formatDateToYMD(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async create(data: CreateReservationDto) {
    const fechaInicio = new Date(data.fechaInicio);
    const fechaFin = new Date(data.fechaFin);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      throw new BadRequestException(
        'Las fechas proporcionadas no son válidas.',
      );
    }

    if (fechaFin <= fechaInicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio.',
      );
    }

    // VALIDAR OVERLAPS
    const overlappingReservation = await this.prisma.reservation.findFirst({
      where: {
        AND: [
          {
            fechaInicio: {
              lt: fechaFin,
            },
          },
          {
            fechaFin: {
              gt: fechaInicio,
            },
          },
        ],
      },
    });

    if (overlappingReservation) {
      throw new ConflictException('Ya existe una reserva en ese horario.');
    }

    // VALIDAR BLOQUEOS
    const bloqueos = await this.prisma.bloqueoFecha.findMany({
      where: {
        activo: true,
      },
    });

    const fechaInicioYMD = this.formatDateToYMD(fechaInicio);

    const hayBloqueo = bloqueos.some((bloqueo) => {
      const bloqueoYMD = this.formatDateToYMD(new Date(bloqueo.fecha));
      return fechaInicioYMD === bloqueoYMD;
    });

    if (hayBloqueo) {
      throw new ConflictException('La fecha seleccionada está bloqueada.');
    }

    // CREAR RESERVA
    return this.prisma.reservation.create({
      data: {
        nombreCliente: data.nombreCliente,
        emailCliente: data.emailCliente,
        telefono: data.telefono,
        fechaInicio,
        fechaFin,
        lugar: data.lugar,
        packageId: data.packageId,
        estado: data.estado ?? 'PENDIENTE',
        toppings: {
          create: (data.toppingsIds || []).map((toppingId) => ({
            toppingId,
          })),
        },
      },
      include: {
        package: true,
        toppings: {
          include: {
            topping: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.reservation.findMany({
      include: {
        package: true,
        toppings: {
          include: {
            topping: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        package: true,
        toppings: {
          include: {
            topping: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException(`La reserva con ID ${id} no existe.`);
    }

    return reservation;
  }

  async updateStatus(id: number, estado: string) {
    await this.findOne(id);
    return this.prisma.reservation.update({
      where: { id },
      data: {
        estado: estado as any,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // ELIMINAR RELACIONES PRIMERO
    await this.prisma.reservaTopping.deleteMany({
      where: {
        reservaId: id,
      },
    });

    return this.prisma.reservation.delete({
      where: { id },
    });
  }
}
