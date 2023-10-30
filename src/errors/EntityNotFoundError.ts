export class EntityNotFoundError extends Error {
  constructor(name: string, query: unknown) {
    super(name + " - query (" + query + ")");
    Object.setPrototypeOf(this, EntityNotFoundError.prototype);
  }
}
