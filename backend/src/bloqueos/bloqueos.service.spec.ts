import { Test, TestingModule } from '@nestjs/testing';
import { BloqueosService } from './bloqueos.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BloqueosService', () => {
  let service: BloqueosService;
  let prisma: PrismaService;

  const mockPrismaService = {
    bloqueoFecha: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloqueosService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BloqueosService>(BloqueosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un bloqueo de fecha (Positivo)', async () => {
      // Arrange
      const dto = { fecha: '2026-12-25', horaInicio: '09:00', horaFin: '18:00', motivo: 'Navidad' };
      const expected = { id: 1, ...dto, fecha: new Date('2026-12-25T00:00:00') };
      mockPrismaService.bloqueoFecha.create.mockResolvedValue(expected);

      // Act
      const result = await service.create(dto as any);

      // Assert
      expect(result).toEqual(expected);
      expect(mockPrismaService.bloqueoFecha.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debe retornar la lista de bloqueos ordenada por fecha', async () => {
      // Arrange
      const expectedList = [{ id: 1, motivo: 'Mantenimiento' }];
      mockPrismaService.bloqueoFecha.findMany.mockResolvedValue(expectedList);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(expectedList);
      expect(mockPrismaService.bloqueoFecha.findMany).toHaveBeenCalledWith({ orderBy: { fecha: 'asc' } });
    });
  });

  describe('remove', () => {
    it('debe eliminar un bloqueo por id', async () => {
      // Arrange
      const expected = { id: 1, motivo: 'Eliminado' };
      mockPrismaService.bloqueoFecha.delete.mockResolvedValue(expected);

      // Act
      const result = await service.remove(1);

      // Assert
      expect(result).toEqual(expected);
      expect(mockPrismaService.bloqueoFecha.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
