import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

export const ordersProviders = [
  {
    provide: 'ORDERS_REPOSITORY',
    useValue: Order,
  },
  {
    provide: 'ORDERITEMS_REPOSITORY',
    useValue: OrderItem,
  },
];