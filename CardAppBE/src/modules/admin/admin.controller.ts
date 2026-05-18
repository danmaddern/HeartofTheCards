import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { AdminService } from './admin.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import {
  AdminStatsEntity,
  ProductEntity,
  SalesReportItemEntity,
  PaginatedInventoryEntity,
  UploadResponseEntity,
} from '../../common/entities';

const imageFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    return cb(new BadRequestException('Only image files are allowed'), false);
  }
  cb(null, true);
};

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiResponse({ status: 200, type: AdminStatsEntity })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('low-stock')
  @ApiResponse({ status: 200, type: [ProductEntity] })
  getLowStock(@Query('threshold') threshold?: string) {
    return this.adminService.getLowStockProducts(Number(threshold) || 10);
  }

  @Get('transactions')
  getTransactions(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getTransactions(Number(page) || 1, Number(limit) || 20);
  }

  @Get('reports/sales')
  @ApiResponse({ status: 200, type: [SalesReportItemEntity] })
  getSalesReport() {
    return this.adminService.getSalesReport();
  }

  @Get('inventory')
  @ApiResponse({ status: 200, type: PaginatedInventoryEntity })
  getInventory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getInventory(Number(page) || 1, Number(limit) || 20, search);
  }

  @Patch('inventory/:id/adjust')
  @ApiResponse({ status: 200, type: ProductEntity })
  adjustStock(
    @Param('id') id: string,
    @Body('adjustment', ParseIntPipe) adjustment: number,
  ) {
    return this.adminService.adjustStock(id, adjustment);
  }

  @Patch('inventory/:id/set-stock')
  @ApiResponse({ status: 200, type: ProductEntity })
  setStock(
    @Param('id') id: string,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.adminService.setStock(id, quantity);
  }

  @Get('charts/revenue')
  getRevenueOverTime(@Query('days') days?: string) {
    return this.adminService.getRevenueOverTime(Number(days) || 30);
  }

  @Get('charts/sales-by-brand')
  getSalesByBrand() {
    return this.adminService.getSalesByBrand();
  }

  @Get('charts/sales-by-type')
  getSalesByProductType() {
    return this.adminService.getSalesByProductType();
  }

  @Get('charts/stock')
  getStockOverview(
    @Query('brand') brand?: string,
    @Query('productType') productType?: string,
  ) {
    return this.adminService.getStockOverview(brand, productType);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: imageFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, type: UploadResponseEntity })
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    };
  }
}
