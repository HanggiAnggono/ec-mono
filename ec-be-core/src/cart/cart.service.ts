import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
// import { Payment } from 'src/payment/entities/payment.entity';
import { Order, OrderStatus } from 'src/order/entities/order.entity';
import { PaymentService } from 'src/payment/payment.service';
import { In, Repository } from 'typeorm';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import {
  CompleteCheckoutDto,
  CompleteCheckoutResponseDto,
} from './dto/complete-checkout.dto';
import { OrderItem } from 'src/order/entities/order-item.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    // @InjectRepository(Payment)
    // private paymentRepository: Repository<Payment>,
    private paymentService: PaymentService,
  ) {}

  async findOrCreateCart(userId?: number, sessionId?: string): Promise<Cart> {
    let cart: Cart | null = null;

    // Check if user has an active cart
    cart = await this.cartRepository.findOne({
      where: [
        { userId, isActive: true, sessionId: userId ? undefined : sessionId },
      ],
      relations: [
        'items',
        'items.productVariant',
        'items.productVariant.product',
      ],
    });

    // Create a new cart if none exists
    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        sessionId: randomUUID(),
        isActive: true,
        items: [],
      });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addToCart(addToCartDto: AddToCartDto, userId?: number): Promise<Cart> {
    // Find or create cart
    const cart = await this.findOrCreateCart(userId, addToCartDto.sessionId);

    // Find product variant
    const productVariant = await this.productVariantRepository.findOne({
      where: { id: addToCartDto.productVariantId },
    });

    if (!productVariant) {
      throw new NotFoundException('Product variant not found');
    }

    // Check if product is in stock_quantity
    if (addToCartDto.quantity > productVariant.stock_quantity) {
      throw new HttpException(
        'Not enough items in stock',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if item is already in cart
    let cartItem = cart.items?.find(
      (item) => item.productVariantId === addToCartDto.productVariantId,
    );

    if (cartItem) {
      // Update quantity if item exists
      cartItem.quantity += addToCartDto.quantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      // Create new cart item
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productVariantId: productVariant.id,
        quantity: addToCartDto.quantity,
        price: productVariant.price,
      });

      await this.cartItemRepository.save(cartItem);
      cart.items.push(cartItem);
    }

    return this.getCart(cart.id);
  }

  async getCart(cartId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOneOrFail({
      where: { id: cartId },
      relations: [
        'items',
        'items.productVariant',
        'items.productVariant.product',
      ],
    });

    return cart;
  }

  async getUserCart(userId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { userId, isActive: true },
      relations: [
        'items',
        'items.productVariant',
        'items.productVariant.product',
      ],
    });

    if (!cart) {
      return this.findOrCreateCart(userId);
    }

    return cart;
  }

  async getSessionCart(userId?: number, sessionId?: string): Promise<Cart> {
    if (userId) {
      return this.findOrCreateCart(userId, sessionId);
    } else if (!userId && sessionId) {
      return this.findOrCreateCart(undefined, sessionId);
    } else {
      return this.findOrCreateCart();
    }
  }

  async updateCartItem(
    cartItemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cartItem = await this.cartItemRepository.findOneOrFail({
      where: { id: cartItemId },
      relations: ['cart'],
    });

    // Check if product is in stock
    const productVariant = await this.productVariantRepository.findOneOrFail({
      where: { id: cartItem.productVariantId },
    });

    if (!productVariant) {
      throw new HttpException(
        'Product variant not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (updateCartItemDto.quantity > productVariant.stock_quantity) {
      throw new HttpException(
        'Not enough items in stock',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (updateCartItemDto.quantity === 0) {
      // Remove item if quantity is 0
      await this.cartItemRepository.remove(cartItem);
    } else {
      // Update quantity
      cartItem.quantity = updateCartItemDto.quantity;
      await this.cartItemRepository.save(cartItem);
    }

    return this.getCart(cartItem.cartId);
  }

  async removeCartItem(cartItemId: number): Promise<Cart> {
    const cartItem = await this.cartItemRepository.findOneOrFail({
      where: { id: cartItemId },
      relations: ['cart'],
    });

    const cartId = cartItem.cartId;
    await this.cartItemRepository.remove(cartItem);

    return this.getCart(cartId);
  }

  async clearCart(cartId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOneOrFail({
      where: { id: cartId },
      relations: ['items'],
    });

    await this.cartItemRepository.remove(cart.items);
    cart.items = [];

    return cart;
  }

  async mergeGuestCartWithUserCart(
    userId: number,
    sessionId: string,
  ): Promise<Cart> {
    const userCart = await this.findOrCreateCart(userId);
    const guestCart = await this.cartRepository.findOne({
      where: { sessionId, isActive: true },
      relations: ['items'],
    });

    if (guestCart && guestCart.items.length > 0) {
      // Transfer items from guest cart to user cart
      for (const item of guestCart.items) {
        // Check if item already exists in user cart
        const existingItem = userCart.items.find(
          (i) => i.productVariantId === item.productVariantId,
        );

        if (existingItem) {
          // Update quantity if item exists
          existingItem.quantity += item.quantity;
          await this.cartItemRepository.save(existingItem);
        } else {
          // Create new cart item in user cart
          const newItem = this.cartItemRepository.create({
            cartId: userCart.id,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            price: item.price,
          });

          await this.cartItemRepository.save(newItem);
          userCart.items.push(newItem);
        }
      }

      // Delete guest cart
      await this.cartRepository.remove(guestCart);
    }

    return this.getCart(userCart.id);
  }

  async checkoutCart(sessionId: string): Promise<CheckoutCartDto> {
    const cart = await this.cartRepository.findOneOrFail({
      where: { sessionId, isActive: true },
      relations: [
        'items',
        'items.productVariant',
        'items.productVariant.product',
      ],
    });

    // validate items are still in stock
    const variantIds = cart.items.map((item) => item.productVariantId);
    const variants = await this.productVariantRepository.findBy({
      id: In(variantIds),
    });

    for (const item of cart.items) {
      const variant = variants.find((v) => v.id === item.productVariantId);
      if (!variant || item.quantity > variant.stock_quantity) {
        throw new Error(
          `Not enough stock for variant ID ${item.productVariantId}`,
        );
      }
    }

    return {
      items: cart.items,
      paymentMethods: ['direct_transfer', 'debit_credit', 'ecpoint'],
    };
  }

  async completeCheckout(
    sessionId: string,
    data: CompleteCheckoutDto,
    // paymentProvider: string,
  ): Promise<CompleteCheckoutResponseDto> {
    const { paymentMethod } = data;
    const cart = await this.cartRepository.findOneOrFail({
      where: { sessionId, isActive: true },
      relations: ['items', 'items', 'items.productVariant'],
    });

    if (!cart.userId) {
      throw new BadRequestException('Login required to complete checkout');
    }

    const user = await this.userRepository.findOne({
      where: { id: cart.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.phone) {
      throw new BadRequestException('Phone number is required to checkout');
    }

    // deactivate cart
    cart.isActive = false;

    await this.cartRepository.save(cart);

    // create order
    const order = this.orderRepository.create({
      user: { id: cart.userId },
      orderItems: cart.items.map((item) => {
        const orderItem = new OrderItem();
        orderItem.productVariantId = item.productVariantId;
        orderItem.price = item.price;
        orderItem.quantity = item.quantity;
        return orderItem;
      }),
      orderDate: new Date(),
      totalAmount: cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
      order_status: OrderStatus.PENDING_PAYMENT,
    });
    await this.orderRepository.save(order);

    const payment = await this.paymentService.createInvoice({
      order_id: order.id,
      amount: order.totalAmount,
      customer: {
        first_name: user.firstname,
        last_name: user.lastname,
        email: user.email,
        phone: user.phone,
      },
      description: `Order ${order.id} via ${paymentMethod}`,
    });

    return { orderId: order.id, transactionToken: payment.transaction_token };
  }
}
