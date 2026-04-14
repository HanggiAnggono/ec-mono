import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { FindOneOrderDto } from './dto/find-one-order.dto';
import { PageParamDto } from 'src/pagination/dto/pagination-param.dto';
import { FindAllOrderDto } from './dto/find-all-order.dto';
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private paymentService: PaymentService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const newOrder = this.orderRepository.create(createOrderDto);
    return await this.orderRepository.save(newOrder);
  }

  async findAll(pagination: PageParamDto): Promise<FindAllOrderDto> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'oi')
      .leftJoinAndSelect('oi.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'prod')
      .orderBy('order.id', 'DESC');
    query.take(pagination.take).skip(pagination.skip);

    const [orders, total] = await query.getManyAndCount();
    const pageCount = Math.ceil(total / pagination.take!);

    const paymentPromises = orders.map(async (item) => {
      const payment = await this.paymentService.getPayment(item.id);
      return payment;
    });

    const payments = await Promise.all(paymentPromises);

    const data = orders.map((item) => {
      const payment = payments.filter((p) => p.order_id === item.id);
      return {
        ...item,
        payment: payment,
      };
    });

    return {
      data,
      totalPage: pageCount,
      totalRecords: total,
      limit: pagination.take!,
      page: pagination.page!,
    };
    // return this.productRepository.find({ relations: ['category'] });
  }

  async findOne(id: string): Promise<FindOneOrderDto> {
    const order = await this.orderRepository.findOneOrFail({
      where: { id },
      relations: ['orderItems', 'orderItems.productVariant.product'],
    });

    const payment = await this.paymentService.getPayment(id);

    return {
      ...order,
      payment,
    };
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    await this.orderRepository.update(id, updateOrderDto);
    return await this.orderRepository.findOneOrFail({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.orderRepository.delete(id);
  }
}
