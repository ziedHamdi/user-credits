export namespace AppErrors {
  export class EntityNotFoundError extends Error {
    constructor(name: string, query: string) {
      super(name + " - query (" + query + ")");
    }
  }

}