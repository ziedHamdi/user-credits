import { Connection, Document, Model, Schema } from "mongoose";

import { IBaseDao } from "../../../db/dao";
import { SystemError } from "../../../errors";

export class BaseMongooseDao<D extends Document> implements IBaseDao<D> {
  model: Model<D>;

  constructor(connection: Connection, schema: Schema<D>, name: string) {
    this.model = connection.model(name, schema, name) as unknown as Model<D>;
  }

  // Wrap a method with try-catch and throw SystemError on error
  protected async wrapWithSystemError<T>(
    operation: () => Promise<T>,
    methodName: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (err) {
      const errorMessage = `Error in ${this.constructor.name}.${methodName}`;
      throw new SystemError(errorMessage, err as Error);
    }
  }

  // Find document by ID
  async findById(userId: object): Promise<D | null> {
    return this.wrapWithSystemError(async () => {
      const result = await this.model.findById(userId).exec();
      return result ? result.toObject() : null;
    }, "findById");
  }

  async findOne(query: object): Promise<D | null> {
    return this.wrapWithSystemError(async () => {
      const result = await this.model.findOne(query).exec();
      return result ? result.toObject() : null;
    }, "findOne");
  }

  // Find documents that match a query
  async find(query: object): Promise<D[]> {
    return this.wrapWithSystemError(async () => {
      const results = await this.model.find(query).exec();
      return results.map((result) => result.toObject());
    }, "find");
  }

  // Create a new document
  async create(data: Partial<D>): Promise<D> {
    return this.wrapWithSystemError(async () => {
      const result = await this.model.create(data);
      return result.toObject();
    }, "create");
  }

  // Update a document by ID
  async updateById(userId: string, update: Partial<D>): Promise<D | null> {
    return this.wrapWithSystemError(async () => {
      const result = await this.model
        .findByIdAndUpdate(userId, update, { new: true })
        .exec();
      return result ? result.toObject() : null;
    }, "updateById");
  }

  // Delete a document by ID
  async deleteById(userId: string): Promise<boolean> {
    return this.wrapWithSystemError(async () => {
      const result = await this.model.findByIdAndDelete(userId).exec();
      return !!result;
    }, "deleteById");
  }

  // Count documents that match a query
  async count(query: object): Promise<number> {
    return this.wrapWithSystemError(async () => {
      const count = await this.model.countDocuments(query).exec();
      return count;
    }, "count");
  }
}
