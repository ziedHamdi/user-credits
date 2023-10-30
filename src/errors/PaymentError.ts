import { BaseError } from "./BaseError";

export class PaymentError<
  E extends Error | undefined = undefined,
> extends BaseError<E> {
  constructor(
    message: string,
    public originalError?: E,
  ) {
    super(message, originalError);
    Object.setPrototypeOf(this, PaymentError.prototype);
  }
}
