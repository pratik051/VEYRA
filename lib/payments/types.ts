export type PaymentProvider = "eSewa" | "Khalti" | "Bank Transfer" | "Cash on Delivery";

export type PaymentInitiationInput = {
  orderId: string;
  amount: number;
  productName: string;
  customerName: string;
  customerPhone: string;
};

export type PaymentInitiationResult = {
  provider: PaymentProvider;
  status: "PENDING_REDIRECT" | "MANUAL_REVIEW" | "COD_PENDING";
  redirectUrl?: string;
  payload?: Record<string, string>;
};
