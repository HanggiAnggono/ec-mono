import { ApiProperty } from '@nestjs/swagger';

import { withPagination } from 'src/pagination/mixin/with-pagination';

export class ProductDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Sample Product' })
  name: string;
  @ApiProperty({ example: 'This is a sample product description.' })
  description: string;
  @ApiProperty({
    example: {
      id: 1,
      name: 'Electronics',
      description: 'Category for electronic products',
    },
  })
  category: {
    id: number;
    name: string;
    description: string;
  };
}

export class FindAllProductDto extends withPagination(ProductDto) {
  declare data: ProductDto[];
}
