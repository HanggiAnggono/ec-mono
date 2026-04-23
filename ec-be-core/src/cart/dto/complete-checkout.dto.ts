import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CompleteCheckoutDto {
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsNumber()
  @IsOptional()
  addressId?: number;
}

export class CompleteCheckoutResponseDto {
  @IsString()
  orderId: string;

  @IsString()
  transactionToken?: string;

  @IsString()
  redirectUrl?: string;
}
