/* import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Order } from '../../orders/entities/order.entity';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'olaclick_dev',
  process.env.POSTGRES_USER || 'postgres',
 process.env.POSTGRES_PASSWORD || 'postgres',
  {
    host: process.env.POSTGRES_HOST || 'postgres',
    port: Number( process.env.POSTGRES_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

export async function testConnection() {
  try {
    sequelize.addModels([Order, OrderItem]);
    await sequelize.authenticate();
    console.log('✅ Conexión establecida con la base de datos.');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
} */
