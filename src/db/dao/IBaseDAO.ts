  export interface IBaseDAO<D extends object> {
    // Count documents that match a query
    count(query: object): Promise<number>;

    // Create a new document
    create(data: Partial<D>): Promise<D>;

    // Delete a document by ID
    deleteById(userId: string): Promise<boolean>;

    // Find documents that match a query
    find(query: object): Promise<D[]>;

    findOne(query: object): Promise<D>;

    findById(userId: object): Promise<D | null>;

    // Update a document by ID
    updateById(userId: string, update: Partial<D>): Promise<D | null>;
  }