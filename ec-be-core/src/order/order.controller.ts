import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { BaseAuthController } from 'src/auth/auth.controller';
import { ApiOkResponse } from '@nestjs/swagger';
import { FindOneOrderDto } from './dto/find-one-order.dto';
import { FindAllOrderDto } from './dto/find-all-order.dto';
import { FindAllOrdersQueryDto } from './dto/find-all-orders-query.dto';
import { PageParamDto } from 'src/pagination/dto/pagination-param.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

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
  async findAll(
    @Query() query: FindAllOrdersQueryDto,
    @Request() req,
  ): Promise<FindAllOrderDto> {
    return this.orderService.findAll(query, req.user.userId);
  }

  @Get('admin')
  @ApiOkResponse({ type: () => FindAllOrderDto })
  async findAllAdmin(
    @Query() query: FindAllOrdersQueryDto,
  ): Promise<FindAllOrderDto> {
    return this.orderService.findAll(query);
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

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, updateOrderStatusDto.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
