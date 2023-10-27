import { BaseError } from "./BaseError";

export class SystemError<E extends Error | undefined> extends BaseError<E> {
  constructor(
    message: string,
    public originalError?: E,
  ) {
    super(message, originalError);
  }
}
