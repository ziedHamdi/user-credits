import { asClass, asFunction, asValue, createContainer } from "awilix";
import { AwilixContainer } from "awilix/lib/container";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Types } from "mongoose";

type ObjectId = Types.ObjectId;

import type { IDaoFactory } from "../../src/db/dao";
import type {
  IOffer,
  IOrder,
  ITokenTimetable,
  IUserCredits,
} from "../../src/db/model";
import { connectToDb } from "../../src/impl/mongoose/connection";
import { MongooseDaoFactory } from "../../src/impl/mongoose/dao/MongooseDaoFactory";
import { EnvConfigReader } from "../../src/impl/mongoose/service/config/EnvConfigReader";
import { StripeClient } from "../../src/impl/service/StripeClient";
import { MockOfferDao } from "../db/dao/mocks/MockOfferDao";
import { MockOrderDao } from "../db/dao/mocks/MockOrderDao";
import { MockTokenTimetableDao } from "../db/dao/mocks/MockTokenTimetableDao";
import { MockUserCreditsDao } from "../db/dao/mocks/MockUserCreditsDao";

export class TestContainerSingleton {
  private static container: AwilixContainer<object>;
  private static active: boolean = false;

  private constructor() {
    // Private constructor to prevent external instantiation
  }
  public static async getInstance(): Promise<AwilixContainer<object>> {
    if (TestContainerSingleton.active) return this.container;
    this.active = true;
    this.container = createContainer();

    const sampleUserId = new Types.ObjectId();
    this.container.register({
      sampleUserId: asValue(sampleUserId),
    });

    const sampleUserCredits = {
      subscriptions: [],
      tokens: 0,
      userId: sampleUserId,
    } as IUserCredits<ObjectId>;

    this.container.register({
      daoFactoryMock: asFunction(() => {
        const offerDaoMock = new MockOfferDao({} as IOffer<ObjectId>);
        const orderDaoMock = new MockOrderDao({} as IOrder<ObjectId>);
        const tokenTimetableMock = new MockTokenTimetableDao(
          {} as ITokenTimetable<ObjectId>,
        );
        const userCreditsDaoMock = new MockUserCreditsDao(sampleUserCredits);

        const daoFactoryMock: IDaoFactory<ObjectId> = {
          getOfferDao: () => offerDaoMock,
          getOrderDao: () => orderDaoMock,
          getTokenTimetableDao: () => tokenTimetableMock,
          getUserCreditsDao: () => userCreditsDaoMock,
        } as unknown as IDaoFactory<ObjectId>;
        return daoFactoryMock;
      }),
    });

    async function initializeMongoServer() {
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await connectToDb(uri, "UserCreditsTests");
      console.log("Mongoose connected to test mongodb: ", uri);
      return mongoServer; // Return the value you want to register
    }

    // Wait for initializeMongoServer to complete before proceeding
    const mongoServer = await initializeMongoServer();
    this.container.register({ mongoServer: asValue(mongoServer) });
    this.container.register({ dbUri: asValue(mongoServer.getUri()) });
    this.container.register({
      mongooseDaoFactory: asFunction(
        () => new MongooseDaoFactory(),
      ).singleton(),
    });

    this.container.register({
      configReader: asClass(EnvConfigReader).singleton(),
      stripeClient: asClass(StripeClient).singleton(),
    });

    return this.container;
  }

  public static async stop() {
    // const mongoServer: MongoMemoryServer = TestContainerSingleton.container.resolve("mongoServer") as MongoMemoryServer;
    // TestContainerSingleton.active = await mongoServer.stop(true);
  }
}