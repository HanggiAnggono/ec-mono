import { mixin } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

export function withPagination<T>(classRef: new () => T) {
  class PaginatedResponseDto {
    @IsArray()
    @ApiProperty({ isArray: true, type: classRef })
    @Type(() => classRef)
    @ValidateNested({ each: true })
    data!: Array<InstanceType<typeof classRef>>;

    @ApiProperty()
    totalRecords: number;
    @ApiProperty()
    totalPage: number;
    @ApiProperty()
    page: number;
    @ApiProperty()
    limit: number;
  }

  return mixin(PaginatedResponseDto);
}
