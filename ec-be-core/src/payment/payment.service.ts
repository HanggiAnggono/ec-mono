import {
  BadGatewayException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { OrderStatus } from 'src/order/entities/order.entity';
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
    return this.fetchPayment(orderId);
  }

  async syncPaymentStatus(orderId: string) {
    const payment = await this.fetchPayment(orderId, true);
    const orderStatus = this.mapTransactionStatusToOrderStatus(
      payment.transaction_status,
    );

    await this.orderSvc.updateStatus(orderId, orderStatus);

    return payment;
  }

  private async fetchPayment(orderId: string, refresh = false) {
    const respUrl =
      this.configService.get('paymentSvcHost')! +
      '/transaction/' +
      orderId +
      (refresh ? '/sync' : '');

    try {
      const resp = await axios.get<GetPaymentDto>(respUrl);
      return resp.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new BadGatewayException(error.response.data);
      }

      throw new InternalServerErrorException('Failed to fetch payment status');
    }
  }

  private mapTransactionStatusToOrderStatus(
    status: GetPaymentDto['transaction_status'],
  ): OrderStatus {
    switch (status) {
      case 'settlement':
      case 'capture':
        return OrderStatus.PAYMENT_RECEIVED;
      case 'expire':
        return OrderStatus.EXPIRED;
      case 'cancel':
        return OrderStatus.CANCELLED;
      case 'deny':
      case 'failure':
        return OrderStatus.FAILED;
      default:
        return OrderStatus.PENDING_PAYMENT;
    }
  }
}
