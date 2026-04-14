import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  CreatePaymentRequestDto,
  CreatePaymentResponseDto,
} from './dto/create-payment.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOkResponse({ type: () => CreatePaymentResponseDto })
  async createPayment(@Body() createPaymentDto: CreatePaymentRequestDto) {
    return await this.paymentService.createInvoice(createPaymentDto);
  }
}
