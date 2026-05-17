import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Public } from '../../common/decorators/public.decorator';
import { PaginatedProductsEntity, ProductEntity } from '../../common/entities';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiResponse({ status: 200, type: PaginatedProductsEntity })
  findAll(@Query() filters: ProductFilterDto) {
    return this.productsService.findAll(filters);
  }

  @Public()
  @Get('featured')
  @ApiResponse({ status: 200, type: [ProductEntity] })
  getFeatured(@Query('limit') limit?: string) {
    return this.productsService.getFeatured(Number(limit) || 8);
  }

  @Public()
  @Get(':slug')
  @ApiResponse({ status: 200, type: ProductEntity })
  findOne(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: ProductEntity })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: ProductEntity })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: ProductEntity })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
