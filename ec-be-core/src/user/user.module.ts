import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/order/entities/order.entity';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, Address]), AuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
