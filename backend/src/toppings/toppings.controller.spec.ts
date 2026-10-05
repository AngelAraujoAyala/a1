import { Test, TestingModule } from '@nestjs/testing';
import { ToppingsController } from './toppings.controller';
import { ToppingsService } from './toppings.service';

describe('ToppingsController', () => {
  let controller: ToppingsController;

  const mockToppingsService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    uploadImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToppingsController],
      providers: [
        {
          provide: ToppingsService,
          useValue: mockToppingsService,
        },
      ],
    }).compile();

    controller = module.get<ToppingsController>(ToppingsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debe retornar todos los toppings', async () => {
      // Arrange
      const expected = [{ id: 1, nombre: 'Luces' }];
      mockToppingsService.findAll.mockResolvedValue(expected);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(expected);
      expect(mockToppingsService.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('debe crear un topping', async () => {
      // Arrange
      const dto = { nombre: 'Luces', precio: 100 };
      const expected = { id: 1, ...dto };
      mockToppingsService.create.mockResolvedValue(expected);

      // Act
      const result = await controller.create(dto);

      // Assert
      expect(result).toEqual(expected);
      expect(mockToppingsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('debe actualizar un topping por id', async () => {
      // Arrange
      const dto = { precio: 120 };
      const expected = { id: 1, nombre: 'Luces', precio: 120 };
      mockToppingsService.update.mockResolvedValue(expected);

      // Act
      const result = await controller.update('1', dto as any);

      // Assert
      expect(result).toEqual(expected);
      expect(mockToppingsService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('debe eliminar un topping por id', async () => {
      // Arrange
      const expected = { id: 1, nombre: 'Luces' };
      mockToppingsService.remove.mockResolvedValue(expected);

      // Act
      const result = await controller.remove('1');

      // Assert
      expect(result).toEqual(expected);
      expect(mockToppingsService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('uploadFile', () => {
    it('debe subir una imagen y retornar la url', async () => {
      // Arrange
      const file = { originalname: 'test.jpg', buffer: Buffer.from('') } as any;
      const expected = { imageUrl: 'http://example.com/test.jpg' };
      mockToppingsService.uploadImage.mockResolvedValue(expected);

      // Act
      const result = await controller.uploadFile(file);

      // Assert
      expect(result).toEqual(expected);
      expect(mockToppingsService.uploadImage).toHaveBeenCalledWith(file);
    });
  });
});
