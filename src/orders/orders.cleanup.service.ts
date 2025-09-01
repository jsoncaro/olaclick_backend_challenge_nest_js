import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Op } from 'sequelize';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersCleanupService {
  private readonly logger = new Logger(OrdersCleanupService.name);

  constructor(
    @Inject('ORDERS_REPOSITORY')
    private readonly ordersRepository: typeof Order,
  ) {}

  // corre cada día a medianoche
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleOldOrdersCleanup() {
    this.logger.log('Ejecutando limpieza de órdenes antiguas...');

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 1); // órdenes de más de 1 mes

    await this.ordersRepository.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoff,
        },
      },
    });

    this.logger.log('Limpieza completada ✅');
  }
}
