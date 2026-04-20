import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  CreatePaymentRequestDto,
  CreatePaymentResponseDto,
} from './dto/create-payment.dto';
import { GetPaymentDto } from './dto/get-payment.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOkResponse({ type: () => CreatePaymentResponseDto })
  async createPayment(@Body() createPaymentDto: CreatePaymentRequestDto) {
    return await this.paymentService.createInvoice(createPaymentDto);
  }

  @Get(':orderId')
  @ApiOkResponse({ type: () => GetPaymentDto })
  async getPayment(@Param('orderId') orderId: string) {
    return await this.paymentService.getPayment(orderId);
  }

  @Get(':orderId/sync')
  @ApiOkResponse({ type: () => GetPaymentDto })
  async syncPayment(@Param('orderId') orderId: string) {
    return await this.paymentService.syncPaymentStatus(orderId);
  }
}
