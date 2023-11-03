import { MongoMemoryServer } from "mongodb-memory-server";
import { Connection, Types } from "mongoose";

import { IDaoFactory } from "../../../src/db/dao";
import { IOffer, IOrder, ISubscription } from "../../../src/db/model";
import { TestContainerSingleton } from "../../config/testContainer";

export type ObjectId = Types.ObjectId;

export function newObjectId(): ObjectId {
  return new Types.ObjectId();
}

export type InitMocksResult = {
  connection: Connection;
  daoFactoryMock: IDaoFactory<ObjectId>;
  mongoMemoryServer: MongoMemoryServer;
  mongooseDaoFactory: IDaoFactory<ObjectId>;
};

export async function initMocks(
  singleton: boolean = true,
): Promise<InitMocksResult> {
  const testContainer = await TestContainerSingleton.getInstance(singleton);

  const daoFactoryMock: IDaoFactory<ObjectId> =
    testContainer.resolve("daoFactoryMock");
  const mongooseDaoFactory: IDaoFactory<ObjectId> =
    testContainer.resolve("mongooseDaoFactory");

  return {
    connection: testContainer.resolve("connection"),
    daoFactoryMock,
    mongoMemoryServer: testContainer.resolve("mongoMemoryServer"),
    mongooseDaoFactory,
  };
}
