import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AddressEntity } from '../../common/entities';
import { User } from '@prisma/client';

@ApiTags('addresses')
@ApiBearerAuth()
@Controller('addresses')
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  @Get()
  @ApiResponse({ status: 200, type: [AddressEntity] })
  findAll(@CurrentUser() user: User) {
    return this.addressesService.findAll(user.id);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: AddressEntity })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.addressesService.findOne(id, user.id);
  }

  @Post()
  @ApiResponse({ status: 201, type: AddressEntity })
  create(@CurrentUser() user: User, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, type: AddressEntity })
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: Partial<CreateAddressDto>,
  ) {
    return this.addressesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.addressesService.remove(id, user.id);
  }
}
