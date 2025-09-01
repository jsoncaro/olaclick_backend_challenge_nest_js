import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import Redis from 'ioredis';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private statuses = ['initiated', 'sent', 'delivered'] as const;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject('ORDERS_REPOSITORY') private ordersRepository: typeof Order,
    @Inject('ORDERITEMS_REPOSITORY') private orderItemsRepository: typeof OrderItem,
  ) { }

  async listAll() {
    try {
      const cacheKey = 'orders:active';
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const orders = await this.ordersRepository.findAll<Order>({
        where: { status: this.statuses },
        include: [OrderItem],
      });

      await this.redis.set(cacheKey, JSON.stringify(orders), 'EX', 30);
      return orders;
    } catch (err) {
      throw new BadRequestException('Error fetching orders');
    }
  }

  async create(payload: CreateOrderDto) {
    const t = await this.ordersRepository.sequelize!.transaction();
    try {
      // calcular total
      const total = payload.items.reduce(
        (s: number, i: any) => s + i.quantity * i.unitPrice,
        0,
      );

      // crear orden
      const order = await this.ordersRepository.create(
        { clientName: payload.clientName, status: 'initiated', total },
        { transaction: t },
      );

      // Crear cada uno de los items de la orden
      for (const it of payload.items) {
        await this.orderItemsRepository.create(
          {
            orderId: order.id,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          },
          { transaction: t },
        );
      }

      await t.commit();
      await this.redis.del('orders:active');
      return order;
    } catch (err) {
      await t.rollback();
      throw new BadRequestException('Error creating order');
    }
  }

  async advance(id: number) {
    const order = await this.ordersRepository.findByPk(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const idx = this.statuses.indexOf(order.status);
    if (idx === -1) {
      throw new BadRequestException('Invalid order status');
    }

    const next = this.statuses[idx + 1];
    if (!next) {
      throw new BadRequestException('Order cannot advance further');
    }

    if (next === 'delivered') {
      await this.orderItemsRepository.destroy({ where: { orderId: id } });
      await this.ordersRepository.destroy({ where: { id } });
      await this.redis.del('orders:active');
      await this.redis.del(`orders:${id}`);
      return { message: 'Order delivered and removed' };
    } else {
      order.status = next;
      await order.save();
      await this.redis.del('orders:active');
      await this.redis.del(`orders:${id}`);
      return order;
    }
  }

  async getById(id: number) {
    try {
      const cacheKey = `orders:${id}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const order = await this.ordersRepository.findByPk(id, {
        include: [OrderItem],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      await this.redis.set(cacheKey, JSON.stringify(order), 'EX', 30);
      return order;
    } catch (err) {
      throw new BadRequestException('Error fetching order by ID');
    }
  }
}
