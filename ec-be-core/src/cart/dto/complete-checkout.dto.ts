import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CompleteCheckoutDto {
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}

export class CompleteCheckoutResponseDto {
  @IsNumber()
  orderId: string;

  @IsString()
  transactionToken?: string;
}
