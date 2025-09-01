import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

describe('OrdersService', () => {
  let service: OrdersService;

  // 🔹 mocks de dependencias
  let mockRedis: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let mockOrdersRepo: any;
  let mockOrderItemsRepo: any;

  beforeEach(async () => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    mockOrdersRepo = {
      findAll: jest.fn(),
      create: jest.fn(),
      findByPk: jest.fn(),
      destroy: jest.fn(),
      sequelize: {
        transaction: jest.fn().mockResolvedValue({
          commit: jest.fn(),
          rollback: jest.fn(),
        }),
      },
    };

    mockOrderItemsRepo = {
      create: jest.fn(),
      destroy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: 'REDIS_CLIENT', useValue: mockRedis },
        { provide: 'ORDERS_REPOSITORY', useValue: mockOrdersRepo },
        { provide: 'ORDERITEMS_REPOSITORY', useValue: mockOrderItemsRepo },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  // 🔹 test para listAll()
  it('✅ should return cached orders if present in redis', async () => {
    const cachedOrders = [{ id: 1, clientName: 'Ana' }];
    mockRedis.get.mockResolvedValueOnce(JSON.stringify(cachedOrders));

    const result = await service.listAll();

    expect(result).toEqual(cachedOrders);
    expect(mockOrdersRepo.findAll).not.toHaveBeenCalled();
  });

  it('✅ should fetch orders from db and set redis cache if not cached', async () => {
    const dbOrders = [{ id: 2, clientName: 'Carlos' }];
    mockRedis.get.mockResolvedValueOnce(null);
    mockOrdersRepo.findAll.mockResolvedValueOnce(dbOrders);

    const result = await service.listAll();

    expect(result).toEqual(dbOrders);
    expect(mockOrdersRepo.findAll).toHaveBeenCalled();
    expect(mockRedis.set).toHaveBeenCalledWith(
      'orders:active',
      JSON.stringify(dbOrders),
      'EX',
      30,
    );
  });

  // 🔹 test para create()
  it('✅ should create an order with items and invalidate cache', async () => {
    const payload = {
      clientName: 'Ana',
      items: [{ description: 'Pizza', quantity: 2, unitPrice: 50 }],
    };

    const mockTx = { commit: jest.fn(), rollback: jest.fn() };
    mockOrdersRepo.sequelize.transaction.mockResolvedValueOnce(mockTx);

    const createdOrder = { id: 1, clientName: 'Ana', status: 'initiated' };
    mockOrdersRepo.create.mockResolvedValueOnce(createdOrder);

    const result = await service.create(payload);

    expect(mockOrdersRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ clientName: 'Ana', total: 100 }),
      { transaction: mockTx },
    );
    expect(mockOrderItemsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: 1, description: 'Pizza' }),
      { transaction: mockTx },
    );
    expect(mockTx.commit).toHaveBeenCalled();
    expect(mockRedis.del).toHaveBeenCalledWith('orders:active');
    expect(result).toEqual(createdOrder);
  });
});
