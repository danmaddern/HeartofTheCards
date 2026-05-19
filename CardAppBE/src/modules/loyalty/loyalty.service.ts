import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoyaltyTransactionType } from '@prisma/client';
import { REWARDS_CATALOG, POINTS_PER_DOLLAR, Reward } from './loyalty.constants';
import { AdjustPointsDto } from './dto/adjust-points.dto';

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  getRewardsCatalog(): Reward[] {
    return REWARDS_CATALOG;
  }

  getRewardById(rewardId: string): Reward | undefined {
    return REWARDS_CATALOG.find((r) => r.id === rewardId);
  }

  calculatePointsEarned(subtotal: number): number {
    return Math.floor(subtotal * POINTS_PER_DOLLAR);
  }

  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyPoints: true, totalPointsEarned: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const transactions = await this.prisma.loyaltyTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { order: { select: { orderNumber: true } } },
    });

    const availableRewards = REWARDS_CATALOG.filter(
      (r) => r.pointsCost <= user.loyaltyPoints,
    );

    return {
      points: user.loyaltyPoints,
      totalEarned: user.totalPointsEarned,
      rewards: REWARDS_CATALOG,
      availableRewards,
      transactions,
    };
  }

  async validateRewardForUser(userId: string, rewardId: string): Promise<Reward> {
    const reward = REWARDS_CATALOG.find((r) => r.id === rewardId);
    if (!reward) throw new BadRequestException('Invalid reward');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyPoints: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.loyaltyPoints < reward.pointsCost) {
      throw new BadRequestException(
        `Insufficient points. You need ${reward.pointsCost} points but have ${user.loyaltyPoints}.`,
      );
    }
    return reward;
  }

  async awardPoints(
    tx: any,
    userId: string,
    orderId: string,
    orderNumber: string,
    subtotal: number,
    pointsUsed: number,
  ): Promise<number> {
    const pointsEarned = this.calculatePointsEarned(subtotal);
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { loyaltyPoints: true },
    });

    let currentBalance = user.loyaltyPoints;

    if (pointsUsed > 0) {
      const balanceAfterRedeem = currentBalance - pointsUsed;
      await tx.user.update({
        where: { id: userId },
        data: { loyaltyPoints: balanceAfterRedeem },
      });
      await tx.loyaltyTransaction.create({
        data: {
          userId,
          orderId,
          type: LoyaltyTransactionType.REDEEM,
          points: -pointsUsed,
          balance: balanceAfterRedeem,
          description: `Redeemed ${pointsUsed} pts on order ${orderNumber}`,
        },
      });
      currentBalance = balanceAfterRedeem;
    }

    if (pointsEarned > 0) {
      const balanceAfterEarn = currentBalance + pointsEarned;
      await tx.user.update({
        where: { id: userId },
        data: {
          loyaltyPoints: balanceAfterEarn,
          totalPointsEarned: { increment: pointsEarned },
        },
      });
      await tx.loyaltyTransaction.create({
        data: {
          userId,
          orderId,
          type: LoyaltyTransactionType.EARN,
          points: pointsEarned,
          balance: balanceAfterEarn,
          description: `Earned ${pointsEarned} pts for order ${orderNumber}`,
        },
      });
    }

    return pointsEarned;
  }

  async adminAdjustPoints(dto: AdjustPointsDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { loyaltyPoints: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const newBalance = Math.max(0, user.loyaltyPoints + dto.points);
    const actualChange = newBalance - user.loyaltyPoints;

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: dto.userId },
        data: {
          loyaltyPoints: newBalance,
          ...(actualChange > 0 ? { totalPointsEarned: { increment: actualChange } } : {}),
        },
      });
      await tx.loyaltyTransaction.create({
        data: {
          userId: dto.userId,
          type: LoyaltyTransactionType.ADMIN_ADJUSTMENT,
          points: actualChange,
          balance: newBalance,
          description: dto.description,
        },
      });
    });

    return { points: newBalance, adjustment: actualChange };
  }

  async adminGetAllUsersPoints(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where: { role: 'CUSTOMER' },
        orderBy: { loyaltyPoints: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          loyaltyPoints: true,
          totalPointsEarned: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);
    return { data: users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async adminGetUserTransactions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, loyaltyPoints: true, totalPointsEarned: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const transactions = await this.prisma.loyaltyTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { order: { select: { orderNumber: true } } },
    });

    return { user, transactions };
  }
}
