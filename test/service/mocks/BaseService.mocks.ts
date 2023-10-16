import { Types } from "mongoose";

import { IDaoFactory } from "../../../src/db/dao";
import { IOffer, IOrder, ISubscription } from "../../../src/db/model";
import { TestContainerSingleton } from "../../config/testContainer";

export type ObjectId = Types.ObjectId;

export function newObjectId(): ObjectId {
  return new Types.ObjectId();
}

export type InitMocksResult = {
  daoFactoryMock: IDaoFactory<ObjectId>;
  dbUri: string;
  mongooseDaoFactory: IDaoFactory<ObjectId>;
  offerChild1: IOffer<ObjectId>;
  offerChild2: IOffer<ObjectId>;
  offerChild3_1: IOffer<ObjectId>;
  offerChild3_2: IOffer<ObjectId>;
  offerRoot1: IOffer<ObjectId>;
  offerRoot2: IOffer<ObjectId>;
  offerRoot3: IOffer<ObjectId>;
  orderOfferRoot1: IOrder<ObjectId>;
  sampleUserId: ObjectId;
  subscriptionPaid1: ISubscription<ObjectId>;
  subscriptionPaid2: ISubscription<ObjectId>;
  subscriptionPaidRoot1: ISubscription<ObjectId>;
  subscriptionPending1: ISubscription<ObjectId>;
  subscriptionRefused1: ISubscription<ObjectId>;
};

export async function kill(): Promise<void> {
  await TestContainerSingleton.stop();
}

export async function initMocks(): Promise<InitMocksResult> {
  const testContainer = await TestContainerSingleton.getInstance();
  // Sample data for testing
  const sampleUserId: ObjectId = testContainer.resolve("sampleUserId");

  const offerRoot1: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "once",
    hasSubOffers: false, // This offer has no sub-offers
    kind: "tokens",
    name: "100 tokens for 100$",
    offerGroup: "ai",
    overridingKey: "100tokens",
    parentOfferId: null as any, // To be updated below
    price: 100,
    quantityLimit: 200,
    tokenCount: 100, // Maximum allowed quantity
  } as IOffer<ObjectId>;

  const offerRoot2: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "monthly",
    hasSubOffers: true, // This offer has sub-offers
    kind: "subscription",
    name: "Starter",
    offerGroup: "subscriptions",
    parentOfferId: null as any, // To be updated below
    price: 50,
    quantityLimit: 5,
    tokenCount: 0, // Maximum allowed quantity
  } as IOffer<ObjectId>;

  const offerRoot3: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "monthly",
    hasSubOffers: true, // This offer has sub-offers
    kind: "subscription",
    name: "Supplement",
    offerGroup: "subscriptions",
    parentOfferId: null as any, // To be updated below
    price: 20,
    quantityLimit: 10,
    tokenCount: 0, // Maximum allowed quantity
  } as IOffer<ObjectId>;

  const offerChild1: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "once",
    hasSubOffers: false, // This offer has no sub-offers
    kind: "tokens",
    name: "20% off on 50 tokens",
    offerGroup: "ai",
    overridingKey: "50tokens",
    parentOfferId: offerRoot2._id, // is a sub-offer of Starter offer
    price: 40,
    tokenCount: 50,
    weight: 1,
  } as IOffer<ObjectId>;

  const offerChild2: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "once",
    hasSubOffers: false, // This offer has no sub-offers
    kind: "tokens",
    name: "30% off on 100 tokens",
    offerGroup: "ai",
    overridingKey: "100tokens",
    parentOfferId: offerRoot2._id, // is a sub-offer of Starter offer overrides the 100tokens offer
    price: 70,
    tokenCount: 100,
  } as IOffer<ObjectId>;

  const offerChild3_1: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "once",
    hasSubOffers: false, // This offer has no sub-offers
    kind: "tokens",
    name: "30% off on 50 tokens",
    offerGroup: "ai",
    overridingKey: "50tokens",
    parentOfferId: offerRoot3._id, // is a sub-offer of Starter offer
    price: 30,
    tokenCount: 50,
    weight: 2,
  } as IOffer<ObjectId>;

  const offerChild3_2: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "once",
    hasSubOffers: false, // This offer has no sub-offers
    kind: "tokens",
    name: "40% off on 100 tokens",
    offerGroup: "ai",
    overridingKey: "100tokens",
    parentOfferId: offerRoot3._id, // is a sub-offer of Starter offer overrides the 100tokens offer
    price: 60,
    tokenCount: 100,
    weight: 2,
  } as IOffer<ObjectId>;

  const orderOfferRoot1: IOrder<ObjectId> = {
    _id: new Types.ObjectId(),
    country: "US",
    currency: "USD",
    customCycle: 3, // Example custom cycle
    cycle: "monthly",
    history: [
      {
        date: new Date(),
        message: "Order created",
        status: "pending",
      },
    ],
    offerGroup: "mockOfferGroup",
    offerId: offerRoot1._id, // Mock ObjectId for offer
    paymentIntentId: "mockPaymentIntentId",
    paymentIntentSecret: "mockPaymentIntentSecret",
    quantity: 1,
    status: "pending",
    taxRate: 0.21, // Example tax rate
    tokenCount: 10, // Example token count
    total: 100, // Example total amount
    userId: new Types.ObjectId(), // Mock ObjectId for user
  } as unknown as IOrder<ObjectId>;

  const subscriptionPaidRoot1: ISubscription<ObjectId> = {
    expires: new Date(),
    offerGroup: offerRoot1.offerGroup,
    offerId: offerRoot1._id,
    orderId: orderOfferRoot1._id,
    starts: new Date(),
    status: "paid",
    tokens: offerRoot1.tokenCount,
  } as unknown as ISubscription<ObjectId>;

  const subscriptionPaid1: ISubscription<ObjectId> = {
    expires: new Date(),
    offerId: offerRoot2._id,
    starts: new Date(),
    status: "paid",
  } as unknown as ISubscription<ObjectId>;

  const subscriptionPaid2: ISubscription<ObjectId> = {
    expires: new Date(),
    offerId: offerRoot3._id,
    starts: new Date(),
    status: "paid",
  } as unknown as ISubscription<ObjectId>;

  const subscriptionPending1: ISubscription<ObjectId> = {
    expires: new Date(),
    offerId: offerRoot1._id,
    starts: new Date(),
    status: "pending",
  } as unknown as ISubscription<ObjectId>;

  const subscriptionRefused1: ISubscription<ObjectId> = {
    expires: new Date(),
    offerId: offerChild1._id,
    starts: new Date(),
    status: "refused",
  } as unknown as ISubscription<ObjectId>;



  const daoFactoryMock: IDaoFactory<ObjectId> =
    testContainer.resolve("daoFactoryMock");
  testContainer.resolve("mongoServer");
  const mongooseDaoFactory: IDaoFactory<ObjectId> =
    testContainer.resolve("mongooseDaoFactory");

  return {
    daoFactoryMock,
    dbUri: testContainer.resolve("dbUri"),
    mongooseDaoFactory,
    offerChild1,
    offerChild2,
    offerChild3_1,
    offerChild3_2,
    offerRoot1,
    offerRoot2,
    offerRoot3,
    orderOfferRoot1,
    sampleUserId,
    subscriptionPaid1,
    subscriptionPaid2,
    subscriptionPaidRoot1,
    subscriptionPending1,
    subscriptionRefused1,
  };
}
