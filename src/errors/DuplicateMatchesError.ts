export class DuplicateMatchesError<T extends object> extends Error {
  duplicates: T[];

  constructor(message: string, duplicates: T[]) {
    super(message);
    Object.setPrototypeOf(this, DuplicateMatchesError.prototype);

    this.name = "DuplicateMatchesError";
    this.duplicates = duplicates;
  }
}
