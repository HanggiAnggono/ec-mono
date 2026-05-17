import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PageParamDto } from 'src/pagination/dto/pagination-param.dto';

export class FindAllProductParam extends PageParamDto {
  @ApiProperty({ example: 'Sample Product', required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
