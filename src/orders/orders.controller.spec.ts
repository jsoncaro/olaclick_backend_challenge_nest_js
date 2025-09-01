import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrdersService = {
    create: jest.fn(dto => ({ id: Date.now(), ...dto })),
    findById: jest.fn(id => ({ id, description: 'Sample', total: 100 })),
    listAll: jest.fn(() => [
      { id: 1, description: 'Order 1', total: 50 },
      { id: 2, description: 'Order 2', total: 100 },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all orders with totals', async () => {
    const result = await controller.list();
    expect(result).toEqual([
      { id: 1, description: 'Order 1', total: 50 },
      { id: 2, description: 'Order 2', total: 100 },
    ]);
    expect(service.listAll).toHaveBeenCalled();
  });
});
