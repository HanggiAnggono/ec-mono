import { ApiProperty } from '@nestjs/swagger';

import { withPagination } from 'src/pagination/mixin/with-pagination';
import { User } from 'src/user/entities/user.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderStatus } from '../entities/order.entity';
import { GetPaymentDto } from 'src/payment/dto/get-payment.dto';

export class OrderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user: User;

  @ApiProperty({ isArray: true, type: () => OrderItem })
  orderItems: OrderItem[];

  @ApiProperty()
  orderDate: Date;

  @ApiProperty()
  totalAmount: number;

  // order status enum pending, pending payment, payment received, orderconfirmed, failed, expired, awaiting shipment,onhold, awaiting pickup, completed, cancelled
  @ApiProperty({
    enumName: 'OrderStatus',
    enum: OrderStatus,
  })
  order_status: OrderStatus;

  @ApiProperty({ isArray: true, type: () => GetPaymentDto })
  payment: GetPaymentDto[];
}

export class FindAllOrderDto extends withPagination(OrderDto) {
  declare data: OrderDto[];
}
