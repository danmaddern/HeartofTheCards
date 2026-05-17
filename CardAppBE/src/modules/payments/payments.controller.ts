import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CapturePayPalOrderResponseEntity, CreatePayPalOrderResponseEntity } from '../../common/entities';
import { User } from '@prisma/client';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('paypal/create-order')
  @ApiResponse({ status: 201, type: CreatePayPalOrderResponseEntity })
  createPayPalOrder(@CurrentUser() user: User, @Body('orderId') orderId: string) {
    return this.paymentsService.createPayPalOrder(orderId, user.id);
  }

  @Post('paypal/capture-order')
  @ApiResponse({ status: 201, type: CapturePayPalOrderResponseEntity })
  capturePayPalOrder(
    @CurrentUser() user: User,
    @Body('paypalOrderId') paypalOrderId: string,
    @Body('orderId') orderId: string,
  ) {
    return this.paymentsService.capturePayPalOrder(paypalOrderId, orderId, user.id);
  }
}
