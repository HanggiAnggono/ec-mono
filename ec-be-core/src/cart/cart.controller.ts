import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Session,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Cart } from './entities/cart.entity';
import { DeleteCartDto } from './dto/delete-cart-dto';
import { ApiBody, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { OptionalAuthGuard } from 'src/auth/guards/optional-auth/optional-auth.guard';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { CompleteCheckoutDto } from './dto/complete-checkout.dto';
import { Order } from 'src/order/entities/order.entity';

// FIXME: Implement proper session typing
interface SessionData {
  id: string;
  [key: string]: any;
}

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Get current cart
  @UseGuards(OptionalAuthGuard)
  @Get()
  @ApiOkResponse({ type: () => Cart })
  @ApiQuery({ name: 'sessionId', required: false, type: String })
  async getCart(
    @Request() req,
    @Query('sessionId') sessionId?: string,
  ): Promise<Cart> {
    const userId: number = req.user.userId;
    return this.cartService.getSessionCart(userId, sessionId);
  }

  // Add item to cart
  @Post('items')
  @ApiOkResponse({ type: () => Cart })
  async addToCart(@Body() addToCartDto: AddToCartDto): Promise<Cart> {
    // TODO: Add authentication and get user ID from JWT token
    // FIXME: Pass user ID as first parameter when auth is implemented
    return this.cartService.addToCart(addToCartDto, undefined);
  }

  // Update cart item quantity
  @Patch('items/:id')
  async updateCartItem(
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<Cart> {
    return this.cartService.updateCartItem(+id, updateCartItemDto);
  }

  // Remove item from cart
  @Delete('items/:id')
  async removeCartItem(@Param('id') id: string): Promise<Cart> {
    return this.cartService.removeCartItem(+id);
  }

  // Clear cart
  @Delete()
  async clearCart(@Body() deleteCartDto: DeleteCartDto): Promise<Cart> {
    const cart = await this.cartService.getSessionCart(
      undefined,
      deleteCartDto.sessionId,
    );
    return this.cartService.clearCart(cart.id);
  }

  // Merge guest cart with user cart after login
  // FIXME: This will be implemented when authentication is added
  @Post('merge')
  async mergeGuestCart(@Session() session: SessionData): Promise<Cart> {
    // TODO: Get user ID from JWT token after authentication is implemented
    // For now, this is just a placeholder that won't work properly
    const userId = 1; // This is a placeholder and should be replaced with actual user ID
    const sessionId = session.id;
    return this.cartService.mergeGuestCartWithUserCart(userId, sessionId);
  }

  @ApiOkResponse({ type: () => CheckoutCartDto })
  @Post(':sessionId/checkout')
  async checkoutCart(@Param('sessionId') sessionId: string) {
    return this.cartService.checkoutCart(sessionId);
  }

  @ApiOkResponse({ type: () => Order })
  @ApiBody({ type: () => CompleteCheckoutDto })
  @Post(':sessionId/complete')
  async completeCheckout(
    @Param('sessionId') sessionId: string,
    @Body() data: CompleteCheckoutDto,
  ) {
    return this.cartService.completeCheckout(sessionId, data);
  }
}
