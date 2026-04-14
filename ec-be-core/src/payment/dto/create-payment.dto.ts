export class CreatePaymentCustomerDto {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export class CreatePaymentRequestDto {
  order_id: string;
  amount: number;
  customer: CreatePaymentCustomerDto;
  description?: string;
}

export class CreatePaymentResponseDto {
  success: boolean;
  transaction_token?: string;
  redirect_url?: string;
  order_id: string;
  message?: string;
  error?: string;
}
