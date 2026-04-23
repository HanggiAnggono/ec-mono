import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderAddress } from './order-address.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PENDING_PAYMENT = 'pending_payment',
  PAYMENT_RECEIVED = 'payment_received',
  ORDER_CONFIRMED = 'order_confirmed',
  FAILED = 'failed',
  EXPIRED = 'expired',
  AWAITING_SHIPMENT = 'awaiting_shipment',
  ON_HOLD = 'on_hold',
  AWAITING_PICKUP = 'awaiting_pickup',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders)
  user: Relation<User>;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  orderItems: Relation<OrderItem[]>;

  @OneToOne(() => OrderAddress, (orderAddress) => orderAddress.order, { cascade: true })
  orderAddress: Relation<OrderAddress>;

  @Column({ type: 'timestamp' })
  orderDate: Date;

  @Column({ type: 'int' })
  totalAmount: number;

  // order status enum pending, pending payment, payment received, orderconfirmed, failed, expired, awaiting shipment,onhold, awaiting pickup, completed, cancelled
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  order_status: OrderStatus;

  @Column({ nullable: true, type: 'int' })
  addressId: number;
}
