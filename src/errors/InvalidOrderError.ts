export class InvalidOrderError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidOrderError.prototype);

    this.name = "InvalidOrderError";
  }
}
