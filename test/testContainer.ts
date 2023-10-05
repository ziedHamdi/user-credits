import { asFunction, asValue, createContainer } from "awilix";
import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

import { MongoMemoryServer } from "mongodb-memory-server";

import { IDaoFactory } from "../src/db/dao";
import { IOffer, IOrder, ITokenTimetable, IUserCredits } from "../src/db/model";
import { MongooseDaoFactory } from "../src/impl/mongoose/dao/MongooseDaoFactory";
import { MockOfferDao } from "./db/dao/MockOfferDao";
import { MockOrderDao } from "./db/dao/MockOrderDao";
import { MockTokenTimetableDao } from "./db/dao/MockTokenTimetableDao";
import { MockUserCreditsDao } from "./db/dao/MockUserCreditsDao";

const testContainer = createContainer();

const sampleUserId = new Types.ObjectId();
testContainer.register({
  sampleUserId: asValue(sampleUserId),
});

const sampleUserCredits = {
  subscriptions: [],
  tokens: 0,
  userId: sampleUserId,
} as IUserCredits<ObjectId>;

testContainer.register({
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
    };
    return daoFactoryMock;
  }),
});

async function initializeMongoServer() {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  console.log("URI for mongodb: ", uri);
  return mongoServer; // Return the value you want to register
}

testContainer.register({
  mongoServer: asFunction(initializeMongoServer).singleton(),
});

const mongoServer = testContainer.resolve("mongoServer");

const uri = mongoServer.getUri();
testContainer.register({
  mongoUri: asValue(uri),
});
const mongooseDaoFactory = new MongooseDaoFactory(uri, "userCredits");
testContainer.register({ mongooseDaoFactory: asValue(mongooseDaoFactory) });

export default testContainer;
export { testContainer };
