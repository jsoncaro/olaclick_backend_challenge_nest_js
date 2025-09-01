import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { OrderItem } from './order-item.entity';

export interface OrderAttributes {
  id?: number;
  clientName: string;
  status: 'initiated' | 'sent' | 'delivered';
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderCreationAttributes
  extends Optional<OrderAttributes, 'id' | 'status' | 'total'> { }

@Table({ tableName: 'orders' })
export class Order extends Model<OrderAttributes, OrderCreationAttributes> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  clientName!: string;

  @Column({
    type: DataType.ENUM('initiated', 'sent', 'delivered'),
    allowNull: false,
    defaultValue: 'initiated',
  })
  status!: 'initiated' | 'sent' | 'delivered';

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  total!: number;

  readonly createdAt!: Date;
  readonly updatedAt!: Date;

  @HasMany(() => OrderItem)
  items!: OrderItem[];
}
