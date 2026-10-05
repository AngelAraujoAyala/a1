import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

describe('ReservationsService', () => {
  let service: ReservationsService;

  const mockPrismaService = {
    reservation: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    bloqueoFecha: {
      findMany: jest.fn(),
    },
    reservaTopping: {
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const validDto = {
      nombreCliente: 'Juan Pérez',
      emailCliente: 'juan@example.com',
      telefono: '6621234567',
      fechaInicio: '2026-10-15T10:00:00.000Z',
      fechaFin: '2026-10-15T14:00:00.000Z',
      lugar: 'Hermosillo',
      packageId: 1,
      toppingsIds: [1, 2],
    };

    it('debe crear una reserva exitosamente cuando no hay conflictos ni bloqueos (Positivo)', async () => {
      // Arrange
      mockPrismaService.reservation.findFirst.mockResolvedValue(null);
      mockPrismaService.bloqueoFecha.findMany.mockResolvedValue([]);
      const expectedReservation = { id: 10, ...validDto, estado: 'PENDIENTE' };
      mockPrismaService.reservation.create.mockResolvedValue(
        expectedReservation,
      );

      // Act
      const result = await service.create(validDto);

      // Assert
      expect(result).toEqual(expectedReservation);
      expect(mockPrismaService.reservation.findFirst).toHaveBeenCalled();
      expect(mockPrismaService.bloqueoFecha.findMany).toHaveBeenCalledWith({
        where: { activo: true },
      });
      expect(mockPrismaService.reservation.create).toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException si fechaFin <= fechaInicio (Límite / Validación)', async () => {
      // Arrange
      const invalidDto = {
        ...validDto,
        fechaInicio: '2026-10-15T14:00:00.000Z',
        fechaFin: '2026-10-15T10:00:00.000Z',
      };

      // Act & Assert
      await expect(service.create(invalidDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar ConflictException si existe solapamiento de horario (Negativo)', async () => {
      // Arrange
      mockPrismaService.reservation.findFirst.mockResolvedValue({
        id: 99,
        nombreCliente: 'Existente',
      });

      // Act & Assert
      await expect(service.create(validDto as any)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.reservation.findFirst).toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si la fecha está bloqueada (Negativo)', async () => {
      // Arrange
      mockPrismaService.reservation.findFirst.mockResolvedValue(null);
      mockPrismaService.bloqueoFecha.findMany.mockResolvedValue([
        { id: 1, fecha: new Date('2026-10-15T00:00:00.000Z'), activo: true },
      ]);

      // Act & Assert
      await expect(service.create(validDto as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('debe retornar todas las reservas', async () => {
      // Arrange
      const mockList = [{ id: 1, nombreCliente: 'Ana' }];
      mockPrismaService.reservation.findMany.mockResolvedValue(mockList);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockList);
      expect(mockPrismaService.reservation.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debe retornar una reserva por id (Positivo)', async () => {
      // Arrange
      const mockRes = { id: 1, nombreCliente: 'Carlos' };
      mockPrismaService.reservation.findUnique.mockResolvedValue(mockRes);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result).toEqual(mockRes);
      expect(mockPrismaService.reservation.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.anything(),
      });
    });

    it('debe lanzar NotFoundException si no existe la reserva (Negativo)', async () => {
      // Arrange
      mockPrismaService.reservation.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('debe actualizar el estado de una reserva', async () => {
      // Arrange
      const mockRes = { id: 1, estado: 'PENDIENTE' };
      const updatedRes = { id: 1, estado: 'CONFIRMADA' };
      mockPrismaService.reservation.findUnique.mockResolvedValue(mockRes);
      mockPrismaService.reservation.update.mockResolvedValue(updatedRes);

      // Act
      const result = await service.updateStatus(1, 'CONFIRMADA');

      // Assert
      expect(result).toEqual(updatedRes);
      expect(mockPrismaService.reservation.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { estado: 'CONFIRMADA' },
      });
    });
  });

  describe('remove', () => {
    it('debe eliminar relaciones y la reserva por id', async () => {
      // Arrange
      const mockRes = { id: 1 };
      mockPrismaService.reservation.findUnique.mockResolvedValue(mockRes);
      mockPrismaService.reservaTopping.deleteMany.mockResolvedValue({
        count: 2,
      });
      mockPrismaService.reservation.delete.mockResolvedValue(mockRes);

      // Act
      const result = await service.remove(1);

      // Assert
      expect(result).toEqual(mockRes);
      expect(mockPrismaService.reservaTopping.deleteMany).toHaveBeenCalledWith({
        where: { reservaId: 1 },
      });
      expect(mockPrismaService.reservation.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
