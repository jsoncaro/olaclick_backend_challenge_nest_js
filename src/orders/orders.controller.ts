
import { Controller, Get, Post, Body, Param, ParseIntPipe, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async list() {
    return this.ordersService.listAll();
  }

  @Post()
  async create(@Body() body: CreateOrderDto) {
    return this.ordersService.create(body);
  }

  @Post(':id/advance')
  async advance(@Param('id', ParseIntPipe) id:number) {
    try {
      return await this.ordersService.advance(id);
    } catch(err:any) {
      throw new HttpException(err.message || 'error', HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id:number) {
    const order = await this.ordersService.getById(id);
    if(!order) throw new NotFoundException();
    return order;
  }
}
