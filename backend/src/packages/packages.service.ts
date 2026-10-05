import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  create(createPackageDto: CreatePackageDto) {
    return this.prisma.package.create({
      data: createPackageDto,
    });
  }

  findAll() {
    return this.prisma.package.findMany({
      orderBy: { precio: 'asc' },
    });
  }

  update(id: number, updatePackageDto: UpdatePackageDto) {
    return this.prisma.package.update({
      where: { id },
      data: updatePackageDto,
    });
  }

  remove(id: number) {
    return this.prisma.package.delete({
      where: { id },
    });
  }
}
