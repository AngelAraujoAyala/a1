import { Test, TestingModule } from '@nestjs/testing';
import { PackagesService } from './packages.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PackagesService', () => {
  let service: PackagesService;

  const mockPrismaService = {
    package: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PackagesService>(PackagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un nuevo paquete correctamente (AAA)', async () => {
      // Arrange
      const dto = {
        nombre: 'Paquete VIP',
        precio: 1500,
        descripcion: 'Incluye todo',
      };
      const expectedResult = { id: 1, ...dto };
      mockPrismaService.package.create.mockResolvedValue(expectedResult);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.package.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  describe('findAll', () => {
    it('debe retornar la lista de paquetes ordenada por precio', async () => {
      // Arrange
      const expectedPackages = [
        { id: 1, nombre: 'Básico', precio: 500 },
        { id: 2, nombre: 'VIP', precio: 1500 },
      ];
      mockPrismaService.package.findMany.mockResolvedValue(expectedPackages);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(expectedPackages);
      expect(mockPrismaService.package.findMany).toHaveBeenCalledWith({
        orderBy: { precio: 'asc' },
      });
    });
  });

  describe('update', () => {
    it('debe actualizar un paquete existente', async () => {
      // Arrange
      const dto = { nombre: 'Básico Plus' };
      const updatedPackage = { id: 1, nombre: 'Básico Plus', precio: 600 };
      mockPrismaService.package.update.mockResolvedValue(updatedPackage);

      // Act
      const result = await service.update(1, dto);

      // Assert
      expect(result).toEqual(updatedPackage);
      expect(mockPrismaService.package.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
      });
    });
  });

  describe('remove', () => {
    it('debe eliminar un paquete por id', async () => {
      // Arrange
      const deletedPackage = { id: 1, nombre: 'Eliminado' };
      mockPrismaService.package.delete.mockResolvedValue(deletedPackage);

      // Act
      const result = await service.remove(1);

      // Assert
      expect(result).toEqual(deletedPackage);
      expect(mockPrismaService.package.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
