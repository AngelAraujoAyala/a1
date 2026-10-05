import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

describe('ReservationsController', () => {
  let controller: ReservationsController;

  const mockReservationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe crear una reserva a través del servicio', async () => {
      // Arrange
      const dto = { nombreCliente: 'Laura' };
      const expected = { id: 1, ...dto };
      mockReservationsService.create.mockResolvedValue(expected);

      // Act
      const result = await controller.create(dto as any);

      // Assert
      expect(result).toEqual(expected);
      expect(mockReservationsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('debe retornar todas las reservas', async () => {
      // Arrange
      const expected = [{ id: 1 }];
      mockReservationsService.findAll.mockResolvedValue(expected);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(expected);
      expect(mockReservationsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debe retornar una reserva por id', async () => {
      // Arrange
      const expected = { id: 1, nombreCliente: 'Laura' };
      mockReservationsService.findOne.mockResolvedValue(expected);

      // Act
      const result = await controller.findOne('1');

      // Assert
      expect(result).toEqual(expected);
      expect(mockReservationsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('updateStatus', () => {
    it('debe actualizar el estado de una reserva', async () => {
      // Arrange
      const expected = { id: 1, estado: 'COMPLETADA' };
      mockReservationsService.updateStatus.mockResolvedValue(expected);

      // Act
      const result = await controller.updateStatus('1', 'COMPLETADA');

      // Assert
      expect(result).toEqual(expected);
      expect(mockReservationsService.updateStatus).toHaveBeenCalledWith(
        1,
        'COMPLETADA',
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar una reserva', async () => {
      // Arrange
      const expected = { id: 1 };
      mockReservationsService.remove.mockResolvedValue(expected);

      // Act
      const result = await controller.remove('1');

      // Assert
      expect(result).toEqual(expected);
      expect(mockReservationsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
