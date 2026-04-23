import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Order } from 'src/order/entities/order.entity';
import { OrderAddress } from 'src/order/entities/order-address.entity';
// import { Payment } from 'src/payment/entities/payment.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';
import { PaymentModule } from 'src/payment/payment.module';
import { User } from 'src/user/entities/user.entity';
import { Address } from 'src/user/entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      ProductVariant,
      Order,
      User,
      OrderAddress,
      Address /* Payment */,
    ]),
    AuthModule,
    PaymentModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
