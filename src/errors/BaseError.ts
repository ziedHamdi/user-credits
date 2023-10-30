export class BaseError<E extends Error | undefined> extends Error {
  constructor(
    message: string,
    public originalError?: E,
  ) {
    super(
      `${message} ${originalError instanceof Error ? originalError.stack : ""}`,
    );
    Object.setPrototypeOf(this, BaseError.prototype);

    this.name = this.constructor.name;
  }
}
