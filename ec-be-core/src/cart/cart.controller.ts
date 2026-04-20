import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Cart } from './entities/cart.entity';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import {
  CompleteCheckoutDto,
  CompleteCheckoutResponseDto,
} from './dto/complete-checkout.dto';
import { Order } from 'src/order/entities/order.entity';
import { BaseAuthController } from 'src/auth/auth.controller';

@Controller('cart')
export class CartController extends BaseAuthController {
  constructor(private readonly cartService: CartService) {
    super();
  }

  private getAuthenticatedUserId(req: any): number {
    return req.user.userId;
  }

  // Get current cart
  @Get()
  @ApiOkResponse({ type: () => Cart })
  async getCart(@Request() req): Promise<Cart> {
    const userId = this.getAuthenticatedUserId(req);
    return this.cartService.getUserCart(userId);
  }

  // Add item to cart
  @Post('items')
  @ApiOkResponse({ type: () => Cart })
  async addToCart(
    @Request() req,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<Cart> {
    const userId = this.getAuthenticatedUserId(req);
    return this.cartService.addToCart(addToCartDto, userId);
  }

  // Update cart item quantity
  @Patch('items/:id')
  async updateCartItem(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const userId = this.getAuthenticatedUserId(req);
    return this.cartService.updateCartItem(+id, updateCartItemDto, userId);
  }

  // Remove item from cart
  @Delete('items/:id')
  async removeCartItem(@Request() req, @Param('id') id: string): Promise<Cart> {
    const userId = this.getAuthenticatedUserId(req);
    return this.cartService.removeCartItem(+id, userId);
  }

  // Clear cart
  @Delete()
  async clearCart(@Request() req): Promise<Cart> {
    const userId = this.getAuthenticatedUserId(req);
    const cart = await this.cartService.getUserCart(userId);
    return this.cartService.clearCart(cart.id);
  }

  // Merge guest cart with user cart after login
  @Post('merge')
  async mergeGuestCart(@Request() req): Promise<Cart> {
    const userId = this.getAuthenticatedUserId(req);
    const sessionId = req.session.id;
    return this.cartService.mergeGuestCartWithUserCart(userId, sessionId);
  }

  @ApiOkResponse({ type: () => CheckoutCartDto })
  @Post('checkout')
  async checkoutCart(@Request() req) {
    const userId = this.getAuthenticatedUserId(req);
    const cart = await this.cartService.getUserCart(userId);
    return this.cartService.checkoutCart(cart.sessionId);
  }

  @ApiOkResponse({ type: () => CompleteCheckoutResponseDto })
  @ApiBody({ type: () => CompleteCheckoutDto })
  @Post('complete')
  async completeCheckout(@Request() req, @Body() data: CompleteCheckoutDto) {
    const userId = this.getAuthenticatedUserId(req);
    const cart = await this.cartService.getUserCart(userId);
    return this.cartService.completeCheckout(cart.sessionId, data);
  }
}
