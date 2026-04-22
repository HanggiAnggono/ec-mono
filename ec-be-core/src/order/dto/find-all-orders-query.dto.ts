import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { PageParamDto } from 'src/pagination/dto/pagination-param.dto';
import { OrderStatus } from '../entities/order.entity';

export class FindAllOrdersQueryDto extends PageParamDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    description: 'Filter by order status',
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  readonly status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filter orders from this date (ISO 8601)',
    example: '2026-01-01',
  })
  @IsDateString()
  @IsOptional()
  readonly dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter orders up to this date (ISO 8601)',
    example: '2026-12-31',
  })
  @IsDateString()
  @IsOptional()
  readonly dateTo?: string;
}
