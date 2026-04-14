import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { OrderService } from 'src/order/order.service';
import { DataSource } from 'typeorm';
import {
  CreatePaymentRequestDto,
  CreatePaymentResponseDto,
} from './dto/create-payment.dto';
import { GetPaymentDto } from './dto/get-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(forwardRef(() => OrderService))
    private readonly orderSvc: OrderService,
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}
  // This service can be expanded with methods for handling payments, refunds, etc.
  // For now, it's a placeholder to demonstrate the structure.
  async createInvoice(
    dto: CreatePaymentRequestDto,
  ): Promise<CreatePaymentResponseDto> {
    const { order_id: orderId } = dto;
    const order = await this.orderSvc.findOne(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    const resp = await axios.post<CreatePaymentResponseDto>(
      this.configService.get('paymentSvcHost')! + '/create-payment',
      dto,
    );

    return resp.data;
  }

  async getPayment(orderId: string) {
    const resp = await axios.get<GetPaymentDto>(
      this.configService.get('paymentSvcHost')! + '/transaction/' + orderId,
    );

    return resp.data;
  }
}
