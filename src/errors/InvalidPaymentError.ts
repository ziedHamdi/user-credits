import { PaymentError } from "./PaymentError";
import { MinimalId } from "../db/model";

export enum PaymentErrorCode {
  AuthorizationError = "Authorization",
  DuplicateAttemptError = "DuplicateAttempt",
  GatewayError = "Gateway",
  ValidationError = "Validation",
}

export interface PaymentErrorDetails<E extends Error | undefined = undefined> {
  errorCode?: PaymentErrorCode;
  orderId?: MinimalId;
  originalError?: E;
}

export class InvalidPaymentError<
  E extends Error | undefined,
> extends PaymentError<E> {
  constructor(
    message: string,
    public options: PaymentErrorDetails<E> = {
      errorCode: PaymentErrorCode.ValidationError,
    } as PaymentErrorDetails<E>,
  ) {
    super(message, options.originalError);
  }
}
