import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { OrderEntity, PaginatedOrdersEntity } from '../../common/entities';
import { User, OrderStatus } from '@prisma/client';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @ApiResponse({ status: 200, type: PaginatedOrdersEntity })
  findMyOrders(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findByUser(user.id, Number(page) || 1, Number(limit) || 10);
  }

  @Post()
  @ApiResponse({ status: 201, type: OrderEntity })
  create(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto);
  }

  @Get('admin/all')
  @UseGuards(AdminGuard)
  @ApiResponse({ status: 200, type: PaginatedOrdersEntity })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.findAll(Number(page) || 1, Number(limit) || 20, status);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: OrderEntity })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const isAdmin = user.role === 'ADMIN';
    return this.ordersService.findOne(id, isAdmin ? undefined : user.id);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  @ApiResponse({ status: 200, type: OrderEntity })
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }
}
