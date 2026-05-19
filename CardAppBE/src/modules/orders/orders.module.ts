import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { EmailModule } from '../email/email.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
  imports: [EmailModule, LoyaltyModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
