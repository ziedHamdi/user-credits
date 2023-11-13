import { IBaseDao, IBaseEntity, SystemError } from "@user-credits/core";
import { Connection, Document, Model, Schema } from "mongoose";

import type { ObjectId } from "../TypeDefs";
import { IAdminDao } from "./IAdminDao";

/**
 * Interface to represent a mongoose entity model
 * @param <A> stands for the object attributes (the fields of an entity before creation)
 * @param <D> stands for the entity attributes (the fields of an entity after creation in mongoose)
 */
export interface EntityModel<
  D extends Document,
  A extends IBaseEntity<ObjectId>,
> extends Model<D> {
  build(attr: A): D;
}

/**
 * @param <A> stands for the object attributes (the fields of an entity before creation)
 * @param <D> stands for the entity attributes (the fields of an entity after creation in mongoose)
 */
export class BaseMongooseDao<
  D extends Document,
  A extends IBaseEntity<ObjectId>,
> implements IAdminDao<ObjectId, D>
{
  model: EntityModel<D, A> & Model<D>;

  constructor(connection: Connection, schema: Schema<D>, name: string) {
    // Enrich the schema with a build method that constructs a mongoose Document from a BaseEntity
    schema.statics.build = (attr: A) => {
      return new Entity(attr); // Even if it's declared before it knows what is Entity, it works as it loads that at the first call.
    };
    this.model = connection.model<D, EntityModel<D, A>>(name, schema, name);
    const Entity = this.model;
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

  build(entry: object): D {
    return this.model.build(entry as A);
  }

  // Find document by ID
  async findById(userId: ObjectId, asPojo: boolean = false): Promise<D | null> {
    return this.wrapWithSystemError(async () => {
      const result = await this.model.findById(userId).exec();
      if (asPojo) return result ? result.toObject() : null;
      return result;
    }, "findById");
  }

  async findOne(query: object, asPojo: boolean = false): Promise<D | null> {
    return this.wrapWithSystemError(async () => {
      const result = await this.model.findOne(query).exec();
      if (asPojo) return result ? result.toObject() : null;
      return result;
    }, "findOne");
  }

  // Find documents that match a query
  async find(query: object, asPojo: boolean = false): Promise<D[]> {
    return this.wrapWithSystemError(async () => {
      const results = await this.model.find(query).exec();
      if (asPojo) return results.map((result) => result.toObject());
      return results;
    }, "find");
  }

  // Create a new document
  async create(data: Partial<D>, asPojo: boolean = false): Promise<D> {
    return this.wrapWithSystemError(async () => {
      const result = await this.model.create(data);
      if (asPojo) return result.toObject();
      return result;
    }, "create");
  }

  // Update a document by ID
  async updateById(
    userId: string,
    update: Partial<D>,
    asPojo: boolean = false,
  ): Promise<D | null> {
    return this.wrapWithSystemError(async () => {
      const result = await this.model
        .findByIdAndUpdate(userId, update, { new: true })
        .exec();
      if (asPojo) return result ? result.toObject() : null;
      return result;
    }, "updateById");
  }

  // Delete a document by ID
  async deleteById(userId: string): Promise<boolean> {
    return this.wrapWithSystemError(async () => {
      const result = await this.model.findByIdAndDelete(userId).exec();
      return !!result;
    }, "deleteById");
  }

  /**
   * Drops the entire collection
   * this method is intentionally hidden from the base interface to oblige developers to cast before use for safety.
   */
  async dropTable(): Promise<void> {
    return this.wrapWithSystemError(async () => {
      // Use Mongoose's drop method to drop the collection
      await this.model.collection.drop();
    }, "dropTable");
  }

  /**
   * Delete multiple rows by query
   * this method is intentionally hidden from the base interface to oblige developers to cast before use for safety.
   */
  async delete(query: any): Promise<number> {
    return this.wrapWithSystemError(async () => {
      const result = await this.model.deleteMany(query).exec();
      return result.deletedCount || 0;
    }, "delete");
  }

  // Count documents that match a query
  async count(query: object): Promise<number> {
    return this.wrapWithSystemError(async () => {
      const count = await this.model.countDocuments(query).exec();
      return count;
    }, "count");
  }
}
