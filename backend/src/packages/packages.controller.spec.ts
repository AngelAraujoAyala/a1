import { Test, TestingModule } from '@nestjs/testing';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';

describe('PackagesController', () => {
  let controller: PackagesController;
  let service: PackagesService;

  const mockPackagesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackagesController],
      providers: [
        {
          provide: PackagesService,
          useValue: mockPackagesService,
        },
      ],
    }).compile();

    controller = module.get<PackagesController>(PackagesController);
    service = module.get<PackagesService>(PackagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe llamar a service.create y retornar el resultado', async () => {
      // Arrange
      const dto = { nombre: 'Gold', precio: 2000, descripcion: 'Paquete de lujo' };
      const expected = { id: 1, ...dto };
      mockPackagesService.create.mockResolvedValue(expected);

      // Act
      const result = await controller.create(dto as any);

      // Assert
      expect(result).toEqual(expected);
      expect(mockPackagesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('debe llamar a service.findAll y retornar todos los paquetes', async () => {
      // Arrange
      const expectedList = [{ id: 1, nombre: 'Gold' }];
      mockPackagesService.findAll.mockResolvedValue(expectedList);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(expectedList);
      expect(mockPackagesService.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('debe llamar a service.update con el id numérico', async () => {
      // Arrange
      const dto = { nombre: 'Gold Editado' };
      const expected = { id: 1, ...dto };
      mockPackagesService.update.mockResolvedValue(expected);

      // Act
      const result = await controller.update('1', dto as any);

      // Assert
      expect(result).toEqual(expected);
      expect(mockPackagesService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('debe llamar a service.remove con el id numérico', async () => {
      // Arrange
      const expected = { id: 1, nombre: 'Gold' };
      mockPackagesService.remove.mockResolvedValue(expected);

      // Act
      const result = await controller.remove('1');

      // Assert
      expect(result).toEqual(expected);
      expect(mockPackagesService.remove).toHaveBeenCalledWith(1);
    });
  });
});
