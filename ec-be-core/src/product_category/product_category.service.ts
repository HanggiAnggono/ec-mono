import { Injectable } from '@nestjs/common';
import { CreateProductCategoryDto } from './dto/create-product_category.dto';
import { UpdateProductCategoryDto } from './dto/update-product_category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategory } from './entities/product_category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private categoryRepository: Repository<ProductCategory>,
  ) {}
  create(createProductCategoryDto: CreateProductCategoryDto) {
    return this.categoryRepository.save(createProductCategoryDto);
  }

  findAll() {
    return this.categoryRepository.find();
  }

  findOne(id: number) {
    return this.categoryRepository.findOneBy({ id });
  }

  update(id: number, updateProductCategoryDto: UpdateProductCategoryDto) {
    return this.categoryRepository.update(id, updateProductCategoryDto);
  }

  remove(id: number) {
    return this.categoryRepository.delete(id);
  }
}
