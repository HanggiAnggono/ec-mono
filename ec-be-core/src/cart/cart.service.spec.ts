import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Repository } from 'typeorm';

// Mock repositories
const mockCartRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockCartItemRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const mockProductVariantRepository = () => ({
  findOne: jest.fn(),
});

describe('CartService', () => {
  let service: CartService;
  let cartRepository: Repository<Cart>;
  let cartItemRepository: Repository<CartItem>;
  let productVariantRepository: Repository<ProductVariant>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useFactory: mockCartRepository },
        {
          provide: getRepositoryToken(CartItem),
          useFactory: mockCartItemRepository,
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useFactory: mockProductVariantRepository,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get<Repository<Cart>>(getRepositoryToken(Cart));
    cartItemRepository = module.get<Repository<CartItem>>(
      getRepositoryToken(CartItem),
    );
    productVariantRepository = module.get<Repository<ProductVariant>>(
      getRepositoryToken(ProductVariant),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests for your service methods here
});
