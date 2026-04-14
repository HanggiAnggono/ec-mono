import { OmitType } from '@nestjs/mapped-types';
import { ProductDto } from './find-all-product.dto';

export class VariantDto {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
}

export class FindOneProductDto extends OmitType(ProductDto, [] as const) {
  id: number;
  name: string;
  description: string;
  category: {
    id: number;
    name: string;
    description: string;
  };
  variants: Array<VariantDto>;
}
