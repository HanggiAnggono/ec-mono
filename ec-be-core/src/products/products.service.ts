import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVariantDto } from './dto/create-variant.dto';
import { Product } from './entities/product.entity';
import { Like, Repository } from 'typeorm';
import { ProductCategory } from 'src/product_category/entities/product_category.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { FindAllProductDto } from './dto/find-all-product.dto';
import { CacheService } from 'src/cache/cache.service';
import { FindAllProductParam } from './dto/find-all-product-param.dto';

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

  private invalidateProduct(productId: number) {
    this.cache.delete(`${this.CACHE_PREFIX}:${productId}`);
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

  async findAll(param: FindAllProductParam): Promise<FindAllProductDto> {
    const cacheKey = `${this.CACHE_PREFIX}:page:${param.page}:limit:${param.take}:name:${param.name?.replace(' ', '')}`;

    console.log({ cacheKey, param });

    return this.cache.query(
      cacheKey,
      async () => {
        const [items, total] = await this.productRepository.findAndCount({
          relations: ['category'],
          where: param.name
            ? {
                name: Like(`%${param.name}%`),
              }
            : undefined,
          take: param.take,
          skip: param.skip,
        });

        console.log({ items });

        const pageCount = Math.ceil(total / param.take!);

        return {
          data: items,
          totalPage: pageCount,
          totalRecords: total,
          limit: param.take!,
          page: param.page!,
        };
      },
      this.CACHE_TTL,
    );
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

    const variantEntities = variants.map((variant) =>
      this.productVariantRepository.create({
        ...variant,
        product,
      }),
    );

    await this.productVariantRepository.save(variantEntities);
    this.invalidateProduct(productId);
    this.invalidateProducts();
    return this.findOne(productId);
  }

  async updateVariant(variantId: number, payload: CreateVariantDto) {
    const variant = await this.productVariantRepository.findOne({
      where: { id: variantId },
      relations: ['product'],
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    const updatedVariant = this.productVariantRepository.merge(
      variant,
      payload,
    );

    if (variant.product?.id) {
      this.invalidateProduct(variant.product.id);
    }
    this.invalidateProducts();
    return this.productVariantRepository.save(updatedVariant);
  }

  async deleteVariant(variantId: number) {
    const variant = await this.productVariantRepository.findOne({
      where: { id: variantId },
      relations: ['product'],
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    if (variant.product?.id) {
      this.invalidateProduct(variant.product.id);
    }
    this.invalidateProducts();
    return this.productVariantRepository.delete(variantId);
  }
}
