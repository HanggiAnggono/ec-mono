import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { FindAllProductDto } from './dto/find-all-product.dto';
import { FindOneProductDto } from './dto/find-one-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { PageParamDto } from 'src/pagination/dto/pagination-param.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOkResponse({ type: () => FindAllProductDto })
  async findAll(@Query() pagination: PageParamDto): Promise<FindAllProductDto> {
    return await this.productsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOkResponse({ type: () => FindOneProductDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  @Post(':id/variants')
  addVariant(@Param('id') id: string, @Body() variants: CreateVariantDto[]) {
    return this.productsService.addVariant(+id, variants);
  }

  @Put('/variants/:variantId')
  updateVariant(
    @Param('variantId') variantId: string,
    @Body() variant: CreateVariantDto,
  ) {
    return this.productsService.updateVariant(+variantId, variant);
  }
}
