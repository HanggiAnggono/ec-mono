import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Order } from './order.entity';
import { ProductVariant } from 'src/products/entities/product-variant.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.orderItems)
  order: Relation<Order>;

  // variant
  @ManyToOne(() => ProductVariant)
  productVariant: ProductVariant;

  @Column({ nullable: true })
  productVariantId: number;

  @Column()
  quantity: number;

  @Column({ type: 'int' })
  price: number; // Price at the time of order, to avoid issues with price changes
}
