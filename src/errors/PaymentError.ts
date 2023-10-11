export class PaymentError extends Error {
  constructor(
    message: string,
    public originalError?: any,
  ) {
    super(message);
    this.name = "StripeError";
  }
}
