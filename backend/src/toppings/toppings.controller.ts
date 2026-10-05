import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ToppingsService } from './toppings.service';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'multer';

@Controller('toppings')
export class ToppingsController {
  constructor(private readonly toppingsService: ToppingsService) {}

  @Post()
  create(@Body() createToppingDto: CreateToppingDto) {
    return this.toppingsService.create(createToppingDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.toppingsService.uploadImage(file);
  }

  @Get()
  findAll() {
    return this.toppingsService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateToppingDto: UpdateToppingDto) {
    return this.toppingsService.update(+id, updateToppingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.toppingsService.remove(+id);
  }
}
