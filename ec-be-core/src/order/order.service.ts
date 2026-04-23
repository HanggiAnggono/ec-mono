import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { FindOneOrderDto } from './dto/find-one-order.dto';
import { FindAllOrderDto } from './dto/find-all-order.dto';
import { FindAllOrdersQueryDto } from './dto/find-all-orders-query.dto';
import { PaymentService } from 'src/payment/payment.service';
import { GetPaymentDto } from 'src/payment/dto/get-payment.dto';

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

  async findAll(
    query: FindAllOrdersQueryDto,
    userId?: string,
  ): Promise<FindAllOrderDto> {
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'oi')
      .leftJoinAndSelect('oi.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'prod')
      .leftJoinAndSelect('order.orderAddress', 'oa')
      .orderBy('order.id', 'DESC');

    if (userId) {
      qb.andWhere('order.user = :userId', { userId });
    }

    if (query.status) {
      qb.andWhere('order.order_status = :status', {
        status: query.status,
      });
    }

    if (query.dateFrom) {
      qb.andWhere('order.orderDate >= :dateFrom', {
        dateFrom: query.dateFrom,
      });
    }

    if (query.dateTo) {
      const to = new Date(query.dateTo);
      to.setDate(to.getDate() + 1);
      qb.andWhere('order.orderDate < :dateTo', { dateTo: to.toISOString() });
    }

    qb.take(query.take).skip(query.skip);

    const [orders, total] = await qb.getManyAndCount();
    const pageCount = Math.ceil(total / query.take!);

    const paymentPromises = orders.map(async (item) => {
      const payment = await this.paymentService.getPayment(item.id);
      return payment;
    });

    const payments = await Promise.all(paymentPromises);

    const data = orders.map((item) => {
      const payment = payments
        .filter((p): p is GetPaymentDto => p !== null && p.order_id === item.id);
      return {
        ...item,
        payment: payment.length > 0 ? payment : null,
      };
    });

    return {
      data,
      totalPage: pageCount,
      totalRecords: total,
      limit: query.take!,
      page: query.page!,
    };
    // return this.productRepository.find({ relations: ['category'] });
  }

  async findOne(id: string): Promise<FindOneOrderDto> {
    const order = await this.orderRepository.findOneOrFail({
      where: { id },
      relations: ['orderItems', 'orderItems.productVariant.product', 'orderAddress'],
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

  async updateStatus(id: string, status: Order['order_status']): Promise<Order> {
    await this.orderRepository.update(id, { order_status: status });
    return await this.orderRepository.findOneOrFail({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.orderRepository.delete(id);
  }
}
