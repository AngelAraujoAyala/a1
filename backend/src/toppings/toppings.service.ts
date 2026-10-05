import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { supabase } from '../supabase/supabase.client';
import type { File as MulterFile } from 'multer';
@Injectable()
export class ToppingsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.topping.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async update(id: number, updateToppingDto: UpdateToppingDto) {
    return await this.prisma.topping.update({
      where: { id },
      data: updateToppingDto,
    });
  }

  create(createToppingDto: CreateToppingDto) {
    return this.prisma.topping.create({
      data: createToppingDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.topping.delete({
      where: { id },
    });
  }

  async uploadImage(file: MulterFile) {
    const fileName = `${Date.now()}-${file.originalname}`;

    const { error } = await supabase.storage
      .from('toppings')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new Error(error.message);
    }

    const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/toppings/${fileName}`;

    return {
      imageUrl,
    };
  }
}
