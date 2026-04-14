import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @IsNumber()
  productVariantId: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
