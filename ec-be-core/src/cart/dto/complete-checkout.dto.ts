import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteCheckoutDto {
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}

export class CompleteCheckoutResponseDto {
  @IsString()
  orderId: string;

  @IsString()
  transactionToken?: string;

  @IsString()
  redirectUrl?: string;
}
