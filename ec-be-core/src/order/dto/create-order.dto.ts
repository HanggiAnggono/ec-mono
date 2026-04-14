import { ApiHideProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  /** The ID of the user placing the order */
  userId: number;
  /** The items in the order */
  @ApiHideProperty()
  orderItems: Array<{
    productVariantId: number;
    quantity: number;
    price: number;
  }>;
}
