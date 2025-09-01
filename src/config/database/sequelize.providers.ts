import { Sequelize } from 'sequelize-typescript';
import { ConfigService } from '@nestjs/config';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Order } from '../../orders/entities/order.entity';

export const sequelizeProvider = {
  provide: 'SEQUELIZE',
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const sequelize = new Sequelize({
      dialect: 'postgres',
      host: configService.get<string>('POSTGRES_HOST', 'postgres'),
      port: configService.get<number>('POSTGRES_PORT', 5432),
      username: configService.get<string>('POSTGRES_USER', 'postgres'),
      password: configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
      database: configService.get<string>('POSTGRES_DB', 'olaclick_dev'),
    });
    sequelize.addModels([Order, OrderItem]);
    await sequelize.sync();
    return sequelize;
  },
};
