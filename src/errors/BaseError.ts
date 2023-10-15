export class BaseError<E extends Error | undefined> extends Error {
  constructor(
    message: string,
    public originalError?: E,
  ) {
    super(
      `${message} ${originalError instanceof Error ? originalError.stack : ""}`,
    );
    this.name = this.constructor.name;
  }
}
