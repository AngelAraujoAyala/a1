import { Test, TestingModule } from '@nestjs/testing';
import { BloqueosController } from './bloqueos.controller';
import { BloqueosService } from './bloqueos.service';

describe('BloqueosController', () => {
  let controller: BloqueosController;
  let service: BloqueosService;

  const mockBloqueosService = {
    create: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BloqueosController],
      providers: [
        {
          provide: BloqueosService,
          useValue: mockBloqueosService,
        },
      ],
    }).compile();

    controller = module.get<BloqueosController>(BloqueosController);
    service = module.get<BloqueosService>(BloqueosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un bloqueo llamando al servicio', async () => {
      // Arrange
      const dto = { fecha: '2026-11-01', motivo: 'Día de Muertos' };
      const expected = { id: 1, ...dto };
      mockBloqueosService.create.mockResolvedValue(expected);

      // Act
      const result = await controller.create(dto as any);

      // Assert
      expect(result).toEqual(expected);
      expect(mockBloqueosService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los bloqueos', async () => {
      // Arrange
      const expected = [{ id: 1, motivo: 'Mantenimiento' }];
      mockBloqueosService.findAll.mockResolvedValue(expected);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(expected);
      expect(mockBloqueosService.findAll).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debe eliminar un bloqueo por id numérico', async () => {
      // Arrange
      const expected = { id: 1 };
      mockBloqueosService.remove.mockResolvedValue(expected);

      // Act
      const result = await controller.remove('1');

      // Assert
      expect(result).toEqual(expected);
      expect(mockBloqueosService.remove).toHaveBeenCalledWith(1);
    });
  });
});
