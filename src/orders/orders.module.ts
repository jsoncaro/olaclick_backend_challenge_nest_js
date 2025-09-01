import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import Redis from 'ioredis';
import { ordersProviders } from './orders.providers';
import { DatabaseModule } from '../config/database/database.module';
import { OrdersCleanupService } from './orders.cleanup.service';

@Module({
  imports: [DatabaseModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrdersCleanupService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        });
      },
    },
    ...ordersProviders,
  ],
  exports: ['REDIS_CLIENT'],
})
export class OrdersModule {}
