// Types generated from OpenAPI specification

export type OrderState = 'PENDING' | 'APPROVED' | 'REJECTED';
export type RejectionReason = 'INSUFFICIENT_CREDIT' | 'UNKNOWN_CUSTOMER' | null;

export interface Money {
  amount: number;
}

export interface CreateOrderRequest {
  customerId: number;
  orderTotal: Money;
}

export interface CreateOrderResponse {
  orderId: number;
}

export interface GetOrderResponse {
  orderId: number;
  orderState: OrderState;
  rejectionReason: RejectionReason;
}

export interface GetOrdersResponse {
  orders: GetOrderResponse[];
}