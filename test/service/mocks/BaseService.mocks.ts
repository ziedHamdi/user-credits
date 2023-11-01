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
  offerChild1: IOffer<ObjectId>;
  offerChild2: IOffer<ObjectId>;
  offerChild3_1: IOffer<ObjectId>;
  offerChild3_2: IOffer<ObjectId>;
  offerRoot1: IOffer<ObjectId>;
  offerRoot2: IOffer<ObjectId>;
  offerRoot3: IOffer<ObjectId>;
  orderOfferRoot1: IOrder<ObjectId>;
  sampleUserId: ObjectId;
  subscriptionPaidRoot1: ISubscription<ObjectId>;
  subscriptionPaidRoot2: ISubscription<ObjectId>;
  subscriptionPaidRoot3: ISubscription<ObjectId>;
  subscriptionPendingChild3_1: ISubscription<ObjectId>;
  subscriptionRefusedChild3_2: ISubscription<ObjectId>;
};

export async function initMocks(
  singleton: boolean = true,
): Promise<InitMocksResult> {
  const testContainer = await TestContainerSingleton.getInstance(singleton);
  // Sample data for testing
  const sampleUserId: ObjectId = testContainer.resolve("sampleUserId");

  const offerRoot1: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "once",
    hasSubOffers: false, // This offer has no sub-offers
    kind: "tokens",
    name: "100 tokens for 100$",
    offerGroup: ["ai"],
    overridingKey: "100tokens",
    price: 100,
    quantityLimit: 200,
    tags: [],
    tokenCount: 100,
    weight: 0,
  } as unknown as IOffer<ObjectId>;

  const offerRoot2: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "monthly",
    hasSubOffers: true, // This offer has sub-offers
    kind: "subscription",
    name: "Starter",
    offerGroup: ["subscriptions"],
    price: 50,
    quantityLimit: 5,
    tags: [],
    tokenCount: 0,
    weight: 0,
  } as unknown as IOffer<ObjectId>;

  const offerRoot3: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "monthly",
    hasSubOffers: true, // This offer has sub-offers
    kind: "subscription",
    name: "Supplement",
    offerGroup: ["subscriptions"],
    price: 20,
    quantityLimit: 10,
    tags: [],
    tokenCount: 0,
    weight: 0,
  } as unknown as IOffer<ObjectId>;

  const offerChild1: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "once",
    hasSubOffers: false, // This offer has no sub-offers
    kind: "tokens",
    name: "20% off on 50 tokens",
    offerGroup: ["ai"],
    overridingKey: "50tokens",
    parentOfferId: offerRoot2._id, // is a sub-offer of Starter offer
    price: 40,
    tags: [],
    tokenCount: 50,
    weight: 1,
  } as unknown as IOffer<ObjectId>;

  const offerChild2: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "once",
    hasSubOffers: false, // This offer has no sub-offers
    kind: "tokens",
    name: "30% off on 100 tokens",
    offerGroup: ["ai"],
    overridingKey: "100tokens",
    parentOfferId: offerRoot2._id, // is a sub-offer of Starter offer overrides the 100tokens offer
    price: 70,
    tags: [],
    tokenCount: 100,
    weight: 1,
  } as unknown as IOffer<ObjectId>;

  const offerChild3_1: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "once",
    hasSubOffers: false, // This offer has no sub-offers
    kind: "tokens",
    name: "30% off on 50 tokens",
    offerGroup: ["ai"],
    overridingKey: "50tokens",
    parentOfferId: offerRoot3._id, // is a sub-offer of Starter offer
    price: 30,
    tags: [],
    tokenCount: 50,
    weight: 2,
  } as unknown as IOffer<ObjectId>;

  const offerChild3_2: IOffer<ObjectId> = {
    _id: newObjectId(),
    cycle: "once",
    hasSubOffers: false, // This offer has no sub-offers
    kind: "tokens",
    name: "40% off on 100 tokens",
    offerGroup: ["ai"],
    overridingKey: "100tokens",
    parentOfferId: offerRoot3._id, // is a sub-offer of Starter offer overrides the 100tokens offer
    price: 60,
    tags: [],
    tokenCount: 100,
    weight: 2,
  } as unknown as IOffer<ObjectId>;

  const orderOfferRoot1: IOrder<ObjectId> = {
    _id: new Types.ObjectId(),
    country: "US",
    currency: "USD",
    cycle: "weekly",
    history: [
      {
        date: new Date(),
        message: "Order created",
        status: "pending",
      },
    ],
    offerGroup: ["mockOfferGroup"],
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

  const orderOfferRoot2: IOrder<ObjectId> = {
    _id: new Types.ObjectId(),
    country: "US",
    currency: "USD",
    cycle: "weekly",
    history: [
      {
        date: new Date(),
        message: "Order created",
        status: "pending",
      },
    ],
    offerGroup: ["mockOfferGroup"],
    offerId: offerRoot2._id, // Mock ObjectId for offer
    paymentIntentId: "mockPaymentIntentId",
    paymentIntentSecret: "mockPaymentIntentSecret",
    quantity: 1,
    status: "pending",
    taxRate: 0.21, // Example tax rate
    tokenCount: 10, // Example token count
    total: 100, // Example total amount
    userId: new Types.ObjectId(), // Mock ObjectId for user
  } as unknown as IOrder<ObjectId>;

  const orderOfferRoot3: IOrder<ObjectId> = {
    _id: new Types.ObjectId(),
    country: "US",
    currency: "USD",
    cycle: "weekly",
    history: [
      {
        date: new Date(),
        message: "Order created",
        status: "pending",
      },
    ],
    offerGroup: ["mockOfferGroup"],
    offerId: offerRoot3._id, // Mock ObjectId for offer
    paymentIntentId: "mockPaymentIntentId",
    paymentIntentSecret: "mockPaymentIntentSecret",
    quantity: 1,
    status: "pending",
    taxRate: 0.21, // Example tax rate
    tokenCount: 10, // Example token count
    total: 100, // Example total amount
    userId: new Types.ObjectId(), // Mock ObjectId for user
  } as unknown as IOrder<ObjectId>;

  const orderOfferPendingChild3_1: IOrder<ObjectId> = {
    _id: new Types.ObjectId(),
    country: "US",
    currency: "USD",
    cycle: "weekly",
    history: [
      {
        date: new Date(),
        message: "Order created",
        status: "pending",
      },
    ],
    offerGroup: ["mockOfferGroup"],
    offerId: offerChild3_1._id, // Mock ObjectId for offer
    paymentIntentId: "mockPaymentIntentId",
    paymentIntentSecret: "mockPaymentIntentSecret",
    quantity: 1,
    status: "pending",
    taxRate: 0.21, // Example tax rate
    tokenCount: 10, // Example token count
    total: 100, // Example total amount
    userId: new Types.ObjectId(), // Mock ObjectId for user
  } as unknown as IOrder<ObjectId>;

  const orderOfferRefusedChild3_2: IOrder<ObjectId> = {
    _id: new Types.ObjectId(),
    country: "US",
    currency: "USD",
    cycle: "weekly",
    history: [
      {
        date: new Date(),
        message: "Order created",
        status: "refused",
      },
    ],
    offerGroup: ["mockOfferGroup"],
    offerId: offerChild3_2._id, // Mock ObjectId for offer
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
    cycle: offerRoot1.cycle,
    name: offerRoot1.name,
    offerGroup: offerRoot1.offerGroup,
    offerId: offerRoot1._id,
    orderId: orderOfferRoot1._id,
    starts: new Date(),
    status: "paid",
    tokens: offerRoot1.tokenCount,
  } as unknown as ISubscription<ObjectId>;

  const subscriptionPaidRoot2: ISubscription<ObjectId> = {
    cycle: offerRoot2.cycle,
    name: offerRoot2.name,
    offerGroup: offerRoot2.offerGroup,
    offerId: offerRoot2._id,
    orderId: orderOfferRoot2._id,
    starts: new Date(),
    status: "paid",
    tokens: offerRoot2.tokenCount,
  } as unknown as ISubscription<ObjectId>;

  const subscriptionPaidRoot3: ISubscription<ObjectId> = {
    cycle: offerRoot3.cycle,
    name: offerRoot3.name,
    offerGroup: offerRoot3.offerGroup,
    offerId: offerRoot3._id,
    orderId: orderOfferRoot3._id,
    starts: new Date(),
    status: "paid",
    tokens: offerRoot3.tokenCount,
  } as unknown as ISubscription<ObjectId>;

  const subscriptionPendingChild3_1: ISubscription<ObjectId> = {
    cycle: offerChild3_1.cycle,
    name: offerChild3_1.name,
    offerGroup: offerChild3_1.offerGroup,
    offerId: offerChild3_1._id,
    orderId: orderOfferPendingChild3_1._id,
    starts: new Date(),
    status: "pending",
    tokens: offerChild3_1.tokenCount,
  } as unknown as ISubscription<ObjectId>;

  const subscriptionRefusedChild3_2: ISubscription<ObjectId> = {
    cycle: offerChild3_2.cycle,
    name: offerChild3_2.name,
    offerGroup: offerChild3_2.offerGroup,
    offerId: offerChild3_2._id,
    orderId: orderOfferRefusedChild3_2._id,
    starts: new Date(),
    status: "refused",
    tokens: offerChild3_2.tokenCount,
  } as unknown as ISubscription<ObjectId>;

  const daoFactoryMock: IDaoFactory<ObjectId> =
    testContainer.resolve("daoFactoryMock");
  const mongooseDaoFactory: IDaoFactory<ObjectId> =
    testContainer.resolve("mongooseDaoFactory");

  return {
    connection: testContainer.resolve("connection"),
    daoFactoryMock,
    mongoMemoryServer: testContainer.resolve("mongoMemoryServer"),
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
    subscriptionPaidRoot1,
    subscriptionPaidRoot2,
    subscriptionPaidRoot3,
    subscriptionPendingChild3_1,
    subscriptionRefusedChild3_2,
  };
}
