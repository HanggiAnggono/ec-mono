// product.entity.ts
import { ProductCategory } from 'src/product_category/entities/product_category.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => ProductCategory, (category) => category.products)
  category: Relation<ProductCategory>;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: Relation<ProductVariant>[];
}
