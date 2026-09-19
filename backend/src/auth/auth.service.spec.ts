import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    admin: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('debe retornar access_token cuando las credenciales son válidas (Positivo)', async () => {
      // Arrange
      const rawPassword = 'password123';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const admin = { id: 1, email: 'admin@test.com', password: hashedPassword };

      mockPrismaService.admin.findUnique.mockResolvedValue(admin);
      mockJwtService.signAsync.mockResolvedValue('jwt_token_123');

      // Act
      const result = await service.login('ADMIN@TEST.COM', rawPassword);

      // Assert
      expect(result).toEqual({ access_token: 'jwt_token_123' });
      expect(mockPrismaService.admin.findUnique).toHaveBeenCalledWith({ where: { email: 'admin@test.com' } });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ sub: 1, email: 'admin@test.com' });
    });

    it('debe lanzar UnauthorizedException si el usuario no existe (Negativo)', async () => {
      // Arrange
      mockPrismaService.admin.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login('noexiste@test.com', 'password')).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si la contraseña no coincide (Negativo)', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('correcto', 10);
      const admin = { id: 1, email: 'admin@test.com', password: hashedPassword };
      mockPrismaService.admin.findUnique.mockResolvedValue(admin);

      // Act & Assert
      await expect(service.login('admin@test.com', 'incorrecto')).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar BadRequestException si falta email o password (Límite)', async () => {
      // Act & Assert
      await expect(service.login('', 'pass')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProfile', () => {
    it('debe retornar el perfil si el administrador existe', async () => {
      // Arrange
      const profile = { email: 'admin@test.com', whatsappNumber: '526624509876' };
      mockPrismaService.admin.findUnique.mockResolvedValue(profile);

      // Act
      const result = await service.getProfile(1);

      // Assert
      expect(result).toEqual(profile);
    });

    it('debe lanzar NotFoundException si no existe el administrador', async () => {
      // Arrange
      mockPrismaService.admin.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getProfile(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('debe actualizar el perfil con nueva contraseña válida (Positivo / Seguridad)', async () => {
      // Arrange
      const updateData = { email: 'nuevo@test.com', password: 'newPassword123', whatsappNumber: '526620001122' };
      const updatedProfile = { email: 'nuevo@test.com', whatsappNumber: '526620001122' };
      mockPrismaService.admin.update.mockResolvedValue(updatedProfile);

      // Act
      const result = await service.updateProfile(1, updateData);

      // Assert
      expect(result).toEqual(updatedProfile);
      expect(mockPrismaService.admin.update).toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException si la contraseña es menor a 8 caracteres (OWASP A07)', async () => {
      // Arrange
      const updateData = { email: 'nuevo@test.com', password: 'short', whatsappNumber: '526620001122' };

      // Act & Assert
      await expect(service.updateProfile(1, updateData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPublicConfig', () => {
    it('debe retornar numero de whatsapp si existe admin', async () => {
      // Arrange
      const config = { whatsappNumber: '526621112233' };
      mockPrismaService.admin.findFirst.mockResolvedValue(config);

      // Act
      const result = await service.getPublicConfig();

      // Assert
      expect(result).toEqual(config);
    });

    it('debe retornar valor default si no existe admin', async () => {
      // Arrange
      mockPrismaService.admin.findFirst.mockResolvedValue(null);

      // Act
      const result = await service.getPublicConfig();

      // Assert
      expect(result).toEqual({ whatsappNumber: '526624509876' });
    });
  });
});
