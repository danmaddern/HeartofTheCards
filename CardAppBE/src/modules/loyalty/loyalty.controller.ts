import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdjustPointsDto } from './dto/adjust-points.dto';
import { User } from '@prisma/client';

@ApiTags('loyalty')
@ApiBearerAuth()
@Controller('loyalty')
export class LoyaltyController {
  constructor(private loyaltyService: LoyaltyService) {}

  @Get('balance')
  getBalance(@CurrentUser() user: User) {
    return this.loyaltyService.getBalance(user.id);
  }

  @Get('rewards')
  getRewards() {
    return this.loyaltyService.getRewardsCatalog();
  }

  @Get('admin/users')
  @UseGuards(AdminGuard)
  adminGetUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.loyaltyService.adminGetAllUsersPoints(Number(page) || 1, Number(limit) || 20);
  }

  @Get('admin/users/:userId/transactions')
  @UseGuards(AdminGuard)
  adminGetUserTransactions(@Param('userId') userId: string) {
    return this.loyaltyService.adminGetUserTransactions(userId);
  }

  @Post('admin/adjust')
  @UseGuards(AdminGuard)
  adminAdjust(@Body() dto: AdjustPointsDto) {
    return this.loyaltyService.adminAdjustPoints(dto);
  }
}
