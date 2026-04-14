import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { BaseAuthController } from 'src/auth/auth.controller';
import { ApiOkResponse } from '@nestjs/swagger';
import { FindOneOrderDto } from './dto/find-one-order.dto';
import { FindAllOrderDto } from './dto/find-all-order.dto';
import { PageParamDto } from 'src/pagination/dto/pagination-param.dto';

@Controller('order')
export class OrderController extends BaseAuthController {
  constructor(private readonly orderService: OrderService) {
    super();
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @ApiOkResponse({ type: () => FindAllOrderDto })
  async findAll(@Query() pagination: PageParamDto): Promise<FindAllOrderDto> {
    return this.orderService.findAll(pagination);
  }

  @Get(':id')
  @ApiOkResponse({ type: () => FindOneOrderDto })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
