import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  fullName: string;

  @IsString()
  line1: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  suburb: string;

  @IsString()
  state: string;

  @IsString()
  postcode: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
