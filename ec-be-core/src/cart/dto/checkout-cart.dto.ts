import { CartItem } from '../entities/cart-item.entity';

export class CheckoutCartDto {
  items: CartItem[];
  paymentMethods: string[];
}
