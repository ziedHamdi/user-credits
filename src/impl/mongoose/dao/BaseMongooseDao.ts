import { Document, Model } from "mongoose";

import { IBaseDao } from "../../../db/dao/IBaseDao";

/**
 * Delegates all calls to mongoose in the constructor passed model property. This is an adapter to allow subclasses to implement local interfaces
 */
export class BaseMongooseDao<D extends Document> implements IBaseDao<D> {
  model: Model<D>;

  constructor(model: Model<D>) {
    this.model = model;
  }

  // Find document by ID
  async findById(userId: object): Promise<D | null> {
    const result = await this.model.findById(userId).exec();
    return result ? result.toObject() : null;
  }

  async findOne(query: object): Promise<D | null> {
    const result = await this.model.findOne( query ).exec();
    return result ? result.toObject() : null;
  }

  // Find documents that match a query
  async find(query: object): Promise<D[]> {
    const results = await this.model.find(query).exec();
    return results.map((result) => result.toObject());
  }

  // Create a new document
  async create(data: Partial<D>): Promise<D> {
    const result = await this.model.create(data);
    return result.toObject();
  }

  // Update a document by ID
  async updateById(userId: string, update: Partial<D>): Promise<D | null> {
    const result = await this.model
      .findByIdAndUpdate(userId, update, { new: true })
      .exec();
    return result ? result.toObject() : null;
  }

  // Delete a document by ID
  async deleteById(userId: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(userId).exec();
    return !!result;
  }

  // Count documents that match a query
  async count(query: object): Promise<number> {
    const count = await this.model.countDocuments(query).exec();
    return count;
  }
}
