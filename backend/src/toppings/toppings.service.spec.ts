import { Test, TestingModule } from '@nestjs/testing';
import { ToppingsService } from './toppings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ToppingsService', () => {
  let service: ToppingsService;

  const mockPrismaService = {
    topping: {
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToppingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ToppingsService>(ToppingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debe retornar lista de toppings ordenados por nombre', async () => {
      // Arrange
      const expectedToppings = [{ id: 1, nombre: 'Chocolates' }];
      mockPrismaService.topping.findMany.mockResolvedValue(expectedToppings);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(expectedToppings);
      expect(mockPrismaService.topping.findMany).toHaveBeenCalledWith({
        orderBy: { nombre: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('debe crear un nuevo topping', async () => {
      // Arrange
      const dto = { nombre: 'Globos', precio: 150 };
      const expected = { id: 2, ...dto };
      mockPrismaService.topping.create.mockResolvedValue(expected);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toEqual(expected);
      expect(mockPrismaService.topping.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  describe('update', () => {
    it('debe actualizar un topping existente', async () => {
      // Arrange
      const dto = { precio: 200 };
      const expected = { id: 1, nombre: 'Globos', precio: 200 };
      mockPrismaService.topping.update.mockResolvedValue(expected);

      // Act
      const result = await service.update(1, dto as any);

      // Assert
      expect(result).toEqual(expected);
      expect(mockPrismaService.topping.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
      });
    });
  });

  describe('remove', () => {
    it('debe eliminar un topping por id', async () => {
      // Arrange
      const expected = { id: 1, nombre: 'Globos' };
      mockPrismaService.topping.delete.mockResolvedValue(expected);

      // Act
      const result = await service.remove(1);

      // Assert
      expect(result).toEqual(expected);
      expect(mockPrismaService.topping.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
