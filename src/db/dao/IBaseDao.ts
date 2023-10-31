export interface IBaseDao<D extends object> {
  /**
   * Used to construct an instance of a document from a raw object
   * @param D
   */
  build(attr: object): D;
  // Count documents that match a query
  count(query: object): Promise<number>;

  // Create a new document
  create(data: Partial<D>): Promise<D>;

  // Delete a document by ID
  deleteById(userId: string): Promise<boolean>;

  // Find documents that match a query
  find(query: object): Promise<D[]>;

  findById(id: object): Promise<D | null>;

  findOne(query: object): Promise<D | null>;

  // findOne(query: object): Promise<D>;

  // Update a document by ID
  updateById(id: string, update: Partial<D>): Promise<D | null>;
}
