import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsUUID,
  IsNumber,
  IsEnum,
  IsIn,
  IsDate,
} from 'class-validator';

/**
 * Local enums — replace or move to shared enums if your project already has them.
 */
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  IDR = 'IDR',
  // add other ISO 4217 codes as needed
}

export enum PaymentType {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  E_WALLET = 'e_wallet',
  // extend with project payment type values
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  // extend as needed
}

export class GetPaymentDto {
  @ApiProperty({
    description: 'HTTP status code equivalent for the transaction result.',
  })
  @IsString()
  status_code: string;

  @ApiProperty({ description: 'Unique ID for the transaction (UUID format).' })
  @IsUUID()
  transaction_id: string;

  @ApiProperty({ description: 'The gross amount of the transaction.' })
  @Type(() => Number)
  @IsNumber()
  gross_amount: number;

  @ApiProperty({
    enum: Currency,
    description: 'Currency code in ISO 4217 format.',
  })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({
    description: "Unique ID for the merchant's order (UUID format).",
  })
  @IsUUID()
  order_id: string;

  @ApiProperty({ enum: PaymentType, description: 'The payment method used.' })
  @IsEnum(PaymentType)
  payment_type: PaymentType;

  @ApiProperty({
    description: 'Hashed signature for verifying data integrity.',
  })
  @IsString()
  signature_key: string;

  @ApiProperty({
    enum: TransactionStatus,
    description: 'The final status of the transaction.',
  })
  @IsEnum(TransactionStatus)
  transaction_status: TransactionStatus;

  @ApiProperty({
    description: 'Result of the fraud detection analysis.',
    enum: ['accept', 'deny', 'challenge'],
  })
  @IsIn(['accept', 'deny', 'challenge'])
  fraud_status: 'accept' | 'deny' | 'challenge';

  @ApiProperty({ description: 'A human-readable message about the status.' })
  @IsString()
  status_message: string;

  @ApiProperty({ description: 'The unique identifier for the merchant.' })
  @IsString()
  merchant_id: string;

  @ApiProperty({ description: 'Type of transaction processing.' })
  @IsString()
  transaction_type: string;

  @ApiProperty({ description: 'The party that issued the payment instrument.' })
  @IsString()
  issuer: string;

  @ApiProperty({
    description: 'The payment processor that acquired the transaction.',
  })
  @IsString()
  acquirer: string;

  @ApiProperty({ description: 'The time the transaction was initiated.' })
  @Type(() => Date)
  @IsDate()
  transaction_time: Date;

  @ApiProperty({
    description: 'The time the transaction was successfully settled.',
  })
  @Type(() => Date)
  @IsDate()
  settlement_time: Date;

  @ApiProperty({
    description: 'The time the payment request would have expired.',
  })
  @Type(() => Date)
  @IsDate()
  expiry_time: Date;
}
