import { Injectable } from '@nestjs/common';
import { CreateProductCategoryDto } from './dto/create-product_category.dto';
import { UpdateProductCategoryDto } from './dto/update-product_category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategory } from './entities/product_category.entity';
import { Repository } from 'typeorm';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private categoryRepository: Repository<ProductCategory>,
    private cache: CacheService,
  ) {}

  private readonly CACHE_KEY = 'categories:all';
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  create(createProductCategoryDto: CreateProductCategoryDto) {
    this.cache.delete(this.CACHE_KEY);
    return this.categoryRepository.save(createProductCategoryDto);
  }

  findAll() {
    return this.cache.query(
      this.CACHE_KEY,
      () => this.categoryRepository.find(),
      this.CACHE_TTL,
    );
  }

  findOne(id: number) {
    return this.cache.query(
      `categories:${id}`,
      () => this.categoryRepository.findOneBy({ id }),
      this.CACHE_TTL,
    );
  }

  update(id: number, updateProductCategoryDto: UpdateProductCategoryDto) {
    this.cache.delete(this.CACHE_KEY);
    this.cache.delete(`categories:${id}`);
    return this.categoryRepository.update(id, updateProductCategoryDto);
  }

  remove(id: number) {
    this.cache.delete(this.CACHE_KEY);
    this.cache.delete(`categories:${id}`);
    return this.categoryRepository.delete(id);
  }
}
