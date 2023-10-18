import { asClass, asFunction, asValue, createContainer } from "awilix";
import { AwilixContainer } from "awilix/lib/container";
import mongoose, { Connection, Types } from "mongoose";

type ObjectId = Types.ObjectId;

// import { EXPECTED_PROPERTIES } from "../../src/Constants";
import { MongoMemoryServer } from "mongodb-memory-server";

import type { IDaoFactory } from "../../src/db/dao";
import type {
  IOffer,
  IOrder,
  ITokenTimetable,
  IUserCredits
} from "../../src/db/model";
import { MongooseDaoFactory } from "../../src/impl/mongoose/dao/MongooseDaoFactory";
import { EnvConfigReader } from "../../src/impl/service/EnvConfigReader";
import { StripeClient } from "../../src/impl/service/StripeClient";
// import { checkContainer } from "../../src/util/AwilixConfigChecker";
import { MockOfferDao } from "../db/dao/mocks/MockOfferDao";
import { MockOrderDao } from "../db/dao/mocks/MockOrderDao";
import { MockTokenTimetableDao } from "../db/dao/mocks/MockTokenTimetableDao";
import { MockUserCreditsDao } from "../db/dao/mocks/MockUserCreditsDao";
import { StripeMock } from "../service/mocks/StripeMock";

interface MongoConnectionAndServer {
  connection: Connection;
  mongoMemoryServer: MongoMemoryServer;
}

async function launchMongoMemoryDb(): Promise<MongoConnectionAndServer> {
  const mongoMemoryServer = await MongoMemoryServer.create();
  const uri = mongoMemoryServer.getUri();
  console.log("connection uri: ", mongoMemoryServer.getUri());
  // Set up the MongoDB connection
  const connection: Connection = mongoose.createConnection(uri);
  return { connection, mongoMemoryServer } as MongoConnectionAndServer;
}

export class TestContainerSingleton {
  private static container: AwilixContainer<object>;
  private static active: boolean = false;

  private constructor() {
    // Private constructor to prevent external instantiation
  }

  public static async getInstance(
    singleton: boolean = true
  ): Promise<AwilixContainer<object>> {
    if (singleton && TestContainerSingleton.active) return this.container;

    const toReturn = createContainer();
    if (singleton) {
      TestContainerSingleton.active = true;
      TestContainerSingleton.container = toReturn;
    }

    const sampleUserId = new Types.ObjectId();
    toReturn.register({
      sampleUserId: asValue(sampleUserId)
    });

    const sampleUserCredits = {
      subscriptions: [],
      tokens: 0,
      userId: sampleUserId
    } as unknown as IUserCredits<ObjectId>;

    toReturn.register({
      daoFactoryMock: asFunction(() => {
        const offerDaoMock = new MockOfferDao({} as IOffer<ObjectId>);
        const orderDaoMock = new MockOrderDao({} as IOrder<ObjectId>);
        const tokenTimetableMock = new MockTokenTimetableDao(
          {} as ITokenTimetable<ObjectId>
        );
        const userCreditsDaoMock = new MockUserCreditsDao(sampleUserCredits);

        const daoFactoryMock: IDaoFactory<ObjectId> = {
          getOfferDao: () => offerDaoMock,
          getOrderDao: () => orderDaoMock,
          getTokenTimetableDao: () => tokenTimetableMock,
          getUserCreditsDao: () => userCreditsDaoMock
        } as unknown as IDaoFactory<ObjectId>;
        return daoFactoryMock;
      })
    });

    const memoryDbAndConnection = await launchMongoMemoryDb();
    toReturn.register({
      mongoMemoryServer: asValue(memoryDbAndConnection.mongoMemoryServer)
    });
    toReturn.register({
      connection: asValue(memoryDbAndConnection.connection)
    });
    toReturn.register({
      mongooseDaoFactory: asValue(
        new MongooseDaoFactory(memoryDbAndConnection.connection),
      ),
    });

    toReturn.register({
      configReader: asClass(EnvConfigReader).singleton()
    });
    toReturn.register({
      stripeClient: asClass(StripeClient).singleton()
    });
    toReturn.register({ stripeMock: asValue(new StripeMock()) });
    toReturn.register({ defaultCurrency: asValue("usd") });

    return toReturn;
  }
}

// const TEST_EXPECTED_PROPERTIES: Record<string, "Value" | "Function"> = {
//   configReader: "Function",
//   daoFactoryMock: "Function",
//   dbUri: "Value",
//   defaultCurrency: "Value",
//   mongoServer: "Value",
//   mongooseDaoFactory: "Function",
//   sampleUserId: "Value",
//   stripeClient: "Function",
//   stripeMock: "Value",
// };

// async function check(): Promise<boolean> {
//   const isContainerValid = checkContainer(
//     await TestContainerSingleton.getInstance(),
//     TEST_EXPECTED_PROPERTIES,
//   );
//   return isContainerValid;
// }
