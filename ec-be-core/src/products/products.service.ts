import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVariantDto } from './dto/create-variant.dto';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ProductCategory } from 'src/product_category/entities/product_category.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { PageParamDto } from 'src/pagination/dto/pagination-param.dto';
import { FindAllProductDto } from './dto/find-all-product.dto';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private categoryRepository: Repository<ProductCategory>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    private cache: CacheService,
  ) {}

  private readonly CACHE_PREFIX = 'products';
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private invalidateProducts() {
    this.cache.deleteByPrefix(this.CACHE_PREFIX);
  }

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);

    if (createProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: createProductDto.categoryId },
      });

      if (category) product.category = category;
    }

    this.invalidateProducts();
    return this.productRepository.save(product);
  }

  async findAll(pagination: PageParamDto): Promise<FindAllProductDto> {
    const cacheKey = `${this.CACHE_PREFIX}:page:${pagination.page}:limit:${pagination.take}`;

    return this.cache.query(cacheKey, async () => {
      const query = this.productRepository.createQueryBuilder('product');
      query
        .leftJoinAndSelect('product.category', 'category')
        .take(pagination.take)
        .skip(pagination.skip);

      const [items, total] = await query.getManyAndCount();
      const pageCount = Math.ceil(total / pagination.take!);

      return {
        data: items,
        totalPage: pageCount,
        totalRecords: total,
        limit: pagination.take!,
        page: pagination.page!,
      };
    }, this.CACHE_TTL);
  }

  findOne(id: number) {
    return this.cache.query(
      `${this.CACHE_PREFIX}:${id}`,
      () =>
        this.productRepository.findOne({
          where: { id },
          relations: ['category', 'variants'],
        }),
      this.CACHE_TTL,
    );
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    this.invalidateProducts();
    return this.productRepository.update(id, updateProductDto);
  }

  remove(id: number) {
    this.invalidateProducts();
    return this.productRepository.delete(id);
  }

  async addVariant(productId: number, variants: CreateVariantDto[]) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    this.invalidateProducts();
    return this.productRepository.save({
      ...product,
      variants,
    });
  }

  async updateVariant(variantId: number, payload: CreateVariantDto) {
    const variant = await this.productVariantRepository.findOneBy({
      id: variantId,
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    const updatedVariant = this.productVariantRepository.merge(
      variant,
      payload,
    );

    this.invalidateProducts();
    return this.productVariantRepository.save(updatedVariant);
  }
}
