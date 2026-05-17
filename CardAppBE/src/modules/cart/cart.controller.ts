import { Controller, Get, Post, Patch, Delete, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CartEntity } from '../../common/entities';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Get()
  @ApiResponse({ status: 200, type: CartEntity })
  getCart(
    @CurrentUser() user: any,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.cartService.getOrCreateCart(user?.id, sessionId);
  }

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Post('items')
  @ApiResponse({ status: 201, type: CartEntity })
  addItem(
    @Body() dto: AddToCartDto,
    @CurrentUser() user: any,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const sid = dto.sessionId || sessionId;
    return this.cartService.addToCart({ ...dto, sessionId: sid }, user?.id);
  }

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Patch('items/:id')
  @ApiResponse({ status: 200, type: CartEntity })
  updateItem(
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: any,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.cartService.updateCartItem(id, dto, user?.id, sessionId);
  }

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Delete('items/:id')
  @ApiResponse({ status: 200, type: CartEntity })
  removeItem(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.cartService.removeCartItem(id, user?.id, sessionId);
  }

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Delete()
  @ApiResponse({ status: 200, type: CartEntity })
  clearCart(
    @CurrentUser() user: any,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.cartService.clearCart(user?.id, sessionId);
  }

  @ApiBearerAuth()
  @Post('merge')
  @ApiResponse({ status: 201 })
  mergeCart(
    @CurrentUser() user: any,
    @Body('sessionId') sessionId: string,
  ) {
    return this.cartService.mergeCart(sessionId, user.id);
  }
}
