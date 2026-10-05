import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    getPublicConfig: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('debe retornar token tras login exitoso', async () => {
      // Arrange
      const body = { email: 'admin@test.com', password: 'secretpassword' };
      const expected = { access_token: 'token_abc_123' };
      mockAuthService.login.mockResolvedValue(expected);

      // Act
      const result = await controller.signIn(body);

      // Assert
      expect(result).toEqual(expected);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        body.email,
        body.password,
      );
    });
  });

  describe('getPublicConfig', () => {
    it('debe retornar la configuración pública', async () => {
      // Arrange
      const expected = { whatsappNumber: '526624509876' };
      mockAuthService.getPublicConfig.mockResolvedValue(expected);

      // Act
      const result = await controller.getPublicConfig();

      // Assert
      expect(result).toEqual(expected);
      expect(mockAuthService.getPublicConfig).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('debe retornar el perfil utilizando req.user.userId', async () => {
      // Arrange
      const req = { user: { userId: 1 } } as any;
      const expected = {
        email: 'admin@test.com',
        whatsappNumber: '526624509876',
      };
      mockAuthService.getProfile.mockResolvedValue(expected);

      // Act
      const result = await controller.getProfile(req);

      // Assert
      expect(result).toEqual(expected);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith(1);
    });
  });

  describe('updateProfile', () => {
    it('debe actualizar el perfil con req.user.userId', async () => {
      // Arrange
      const req = { user: { userId: 1 } } as any;
      const body = { email: 'nuevo@test.com', whatsappNumber: '123456' };
      const expected = { email: 'nuevo@test.com', whatsappNumber: '123456' };
      mockAuthService.updateProfile.mockResolvedValue(expected);

      // Act
      const result = await controller.updateProfile(req, body);

      // Assert
      expect(result).toEqual(expected);
      expect(mockAuthService.updateProfile).toHaveBeenCalledWith(1, body);
    });
  });
});
