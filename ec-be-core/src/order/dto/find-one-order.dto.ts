import { PickType } from '@nestjs/swagger';
import { Order } from '../entities/order.entity';
import { GetPaymentDto } from 'src/payment/dto/get-payment.dto';

export class FindOneOrderDto extends PickType(Order, [
  'id',
  'orderDate',
  'orderItems',
  'order_status',
  'totalAmount',
] as const) {
  payment: GetPaymentDto;
}
