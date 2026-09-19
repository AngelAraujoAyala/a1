import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    if (!email || !pass) {
      throw new BadRequestException('Email y contraseña son requeridos');
    }

    const cleanEmail = email.toLowerCase().trim();
    const admin = await this.prisma.admin.findUnique({ where: { email: cleanEmail } });

    if (!admin) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(pass, admin.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: admin.id, email: admin.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async getPublicConfig() {
    const admin = await this.prisma.admin.findFirst({
      select: { whatsappNumber: true },
    });
    if (!admin) return { whatsappNumber: '526624509876' };
    return admin;
  }

  async getProfile(id: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: { email: true, whatsappNumber: true },
    });
    if (!admin) throw new NotFoundException('Administrador no encontrado');
    return admin;
  }

  async updateProfile(
    id: number,
    data: { email: string; password?: string; whatsappNumber: string },
  ) {
    const cleanEmail = data.email?.toLowerCase().trim();
    const updateData: Prisma.AdminUpdateInput = {
      email: cleanEmail,
      whatsappNumber: data.whatsappNumber,
    };

    if (data.password && data.password.trim() !== '') {
      if (data.password.length < 8) {
        throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
      }
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.admin.update({
      where: { id },
      data: updateData,
      select: { email: true, whatsappNumber: true },
    });
  }
}

