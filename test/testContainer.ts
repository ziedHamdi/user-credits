import { asFunction, asValue, createContainer } from "awilix";
import { ObjectId } from "bson";

import { IDaoFactory } from "../src/db/dao";
import { IOffer, IOrder, ITokenTimetable, IUserCredits } from "../src/db/model";
import { MockOfferDao } from "./db/dao/MockOfferDao";
import { MockOrderDao } from "./db/dao/MockOrderDao";
import { MockTokenTimetableDao } from "./db/dao/MockTokenTimetableDao";
import { MockUserCreditsDao } from "./db/dao/MockUserCreditsDao";

const testContainer = createContainer();

const sampleUserId = new ObjectId();
testContainer.register({
  sampleUserId: asValue(sampleUserId),
});

const sampleUserCredits = {
  subscriptions: [],
  tokens: 0,
  userId: sampleUserId,
} as IUserCredits<ObjectId>;

testContainer.register({
  daoFactory: asFunction(() => {
    const offerDaoMock = new MockOfferDao({} as IOffer<ObjectId>, null);
    const orderDaoMock = new MockOrderDao({} as IOrder<ObjectId>, null);
    const tokenTimetableMock = new MockTokenTimetableDao(
      {} as ITokenTimetable<ObjectId>,
      null,
    );
    const userCreditsDaoMock = new MockUserCreditsDao(sampleUserCredits, null);

    const daoFactoryMock: IDaoFactory<ObjectId> = {
      getOfferDao: () => offerDaoMock,
      getOrderDao: () => orderDaoMock,
      getTokenTimetableDao: () => tokenTimetableMock,
      getUserCreditsDao: () => userCreditsDaoMock,
    };
    return daoFactoryMock;
  }),
});

export default testContainer;
