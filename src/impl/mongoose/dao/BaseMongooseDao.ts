import { Connection, Document, Model, Schema } from "mongoose";

import { IBaseDao } from "../../../db/dao";
import { IBaseEntity } from "../../../db/model";
import { SystemError } from "../../../errors";
import type { ObjectId } from "../TypeDefs";

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
> implements IBaseDao<D>
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
  async findById(userId: object): Promise<D | null> {
    return this.wrapWithSystemError(async () => {
      const result = await this.model.findById(userId).exec();
      // return result ? result.toObject() : null;
      return result;
    }, "findById");
  }

  async findOne(query: object): Promise<D | null> {
    return this.wrapWithSystemError(async () => {
      const result = await this.model.findOne(query).exec();
      // return result ? result.toObject() : null;
      return result;
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
      return result;
    }, "create");
  }

  // Update a document by ID
  async updateById(userId: string, update: Partial<D>): Promise<D | null> {
    return this.wrapWithSystemError(async () => {
      const result = await this.model
        .findByIdAndUpdate(userId, update, { new: true })
        .exec();
      // return result ? result.toObject() : null;
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

  // Count documents that match a query
  async count(query: object): Promise<number> {
    return this.wrapWithSystemError(async () => {
      const count = await this.model.countDocuments(query).exec();
      return count;
    }, "count");
  }
}
