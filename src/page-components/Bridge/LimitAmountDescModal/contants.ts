export interface ReceiptRateLimitsInfo {
  token: string;
  capacity: number;
  refillRate: number;
  maximumTimeConsumed: number;
}

export interface RateLimitItem {
  fromChain: string;
  toChain: string;
  receiptRateLimitsInfo: Array<ReceiptRateLimitsInfo>;
  swapRateLimitsInfo: Array<ReceiptRateLimitsInfo>;
}
