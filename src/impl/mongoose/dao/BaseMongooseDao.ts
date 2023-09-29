import { Document, Model } from "mongoose";

/**
 * Delegates all calls to mongoose in the constructor passed model property. This is an adapter to allow subclasses to implement local interfaces
 */
export class BaseMongooseDao<K extends Document> {
  model: Model<K>;

  constructor(model: Model<K>) {
    this.model = model;
  }

  // Find document by ID
  async findById(userId: string): Promise<K | null> {
    const result = await this.model.findById(userId).exec();
    return result ? result.toObject() : null;
  }

  // Find documents that match a query
  async find(query: any): Promise<K[]> {
    const results = await this.model.find(query).exec();
    return results.map((result) => result.toObject());
  }

  // Create a new document
  async create(data: Partial<K>): Promise<K> {
    const result = await this.model.create(data);
    return result.toObject();
  }

  // Update a document by ID
  async updateById(userId: string, update: Partial<K>): Promise<K | null> {
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
  async count(query: any): Promise<number> {
    const count = await this.model.countDocuments(query).exec();
    return count;
  }
}
