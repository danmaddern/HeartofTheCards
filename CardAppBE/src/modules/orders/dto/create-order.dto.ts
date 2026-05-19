import { IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  deliveryAddressId: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  rewardId?: string;
}
