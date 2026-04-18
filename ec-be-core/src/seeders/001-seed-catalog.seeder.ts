import { DataSource } from 'typeorm';

import { Seeder } from '@jorgebodega/typeorm-seeding';

export default class SeedCatalogSeeder extends Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const categoryRepo = dataSource.getRepository('ProductCategory');
    const productRepo = dataSource.getRepository('Product');
    const variantRepo = dataSource.getRepository('ProductVariant');

    const existingCategories = await categoryRepo.count();
    if (existingCategories > 0) {
      return;
    }

    const categories = await categoryRepo.save(
      categoryRepo.create([
        {
          name: 'Accessories',
          description: 'Bags, wallets, and add-ons',
        },
        {
          name: 'Apparel',
          description: 'Clothing and wearables',
        },
      ]),
    );

    const [accessories, apparel] = categories;

    const products = await productRepo.save(
      productRepo.create([
        {
          name: 'Canvas Tote Bag',
          description: 'A durable everyday tote bag.',
          category: accessories,
        },
        {
          name: 'Heavyweight Hoodie',
          description: 'A soft pullover hoodie for daily wear.',
          category: apparel,
        },
      ]),
    );

    await variantRepo.save(
      variantRepo.create([
        {
          name: 'Canvas Tote Bag - Black',
          price: 250000,
          stock_quantity: 25,
          product: products[0],
        },
        {
          name: 'Heavyweight Hoodie - Grey / M',
          price: 450000,
          stock_quantity: 18,
          product: products[1],
        },
      ]),
    );
  }
}
