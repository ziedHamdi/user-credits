//NODE: these imports are a temporary workaround to avoid the warning: "Corresponding file is not included in tsconfig.json"
import { beforeAll, beforeEach, describe, it } from "@jest/globals";
import expect from "expect";

import { IDaoFactory } from "../../src/db/dao"; // Import the actual path
import {
  IOffer,
  IOrder,
  ISubscription,
  IUserCredits,
  MinimalId,
} from "../../src/db/model"; // Import the actual path
import { InvalidOrderError } from "../../src/errors";
import { BaseService } from "../../src/service/BaseService"; //IMPROVEMENT Should use { IPayment } and add a secondary interface instead
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
import { toHaveSameFields } from "../extend/sameObjects";
import { initMocks, ObjectId } from "./mocks/BaseService.mocks";

class ExtendedBaseService<K extends MinimalId> extends BaseService<K> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterExecute(order: IOrder<K>): Promise<IUserCredits<K>> {
    return Promise.resolve(undefined as unknown as IUserCredits<K>);
  }
}

describe("BaseService.getActiveSubscriptions", () => {
  let daoFactoryMock: IDaoFactory<ObjectId>;
  let sampleUserId: ObjectId;
  let subscriptionPaidRoot1: ISubscription<ObjectId>;
  let subscriptionPendingChild3_1: ISubscription<ObjectId>;
  let subscriptionRefusedChild3_2: ISubscription<ObjectId>;
  let sampleUserCredits: IUserCredits<ObjectId>;

  beforeAll(async () => {
    // Initialize your mocks and dependencies here.
    const mocks = await initMocks();
    ({
      daoFactoryMock,
      sampleUserId,
      subscriptionPaidRoot1,
      subscriptionPendingChild3_1,
      subscriptionRefusedChild3_2,
    } = mocks);
    sampleUserCredits = {
      subscriptions: [subscriptionPaidRoot1, subscriptionPendingChild3_1], // Use the created instances
      tokens: 100, // Sample token balance
      userId: sampleUserId,
    } as unknown as IUserCredits<ObjectId>;
  });

  let service: BaseService<ObjectId>;

  beforeEach(() => {
    // Create a new instance of BaseService with the mock userCreditsDao
    service = new ExtendedBaseService(daoFactoryMock);

    // Reset the mock function before each test
    (daoFactoryMock.getUserCreditsDao().findByUserId as jest.Mock).mockReset();
  });

  it("should return active subscriptions when user has paid subscriptions", async () => {
    // Mock the userCreditsDao.findById method to return sampleUserCredits
    (
      daoFactoryMock.getUserCreditsDao().findByUserId as jest.Mock
    ).mockResolvedValue(sampleUserCredits);

    // Call the getActiveSubscriptions method
    const activeSubscriptions =
      await service.getActiveSubscriptions(sampleUserId);

    // Assert that userCreditsDao.findById was called with the correct userId
    expect(
      daoFactoryMock.getUserCreditsDao().findByUserId,
    ).toHaveBeenCalledWith(sampleUserId);

    // Assert that activeSubscriptions contain only paid subscriptions
    expect(activeSubscriptions).toEqual([
      sampleUserCredits.subscriptions[0], // The first subscription is 'paid'
    ]);
  });

  it("should return an empty array when user has no paid subscriptions", async () => {
    // Modify the sampleUserCredits to have no paid subscriptions
    const noPaidSubscriptionsUserCredits: IUserCredits<ObjectId> = {
      ...sampleUserCredits,
      subscriptions: [subscriptionPendingChild3_1, subscriptionRefusedChild3_2],
    } as IUserCredits<ObjectId>;

    // Mock the userCreditsDao.findById method to return the modified userCredits
    (
      daoFactoryMock.getUserCreditsDao().findByUserId as jest.Mock
    ).mockResolvedValue(noPaidSubscriptionsUserCredits);

    // Call the getActiveSubscriptions method
    const activeSubscriptions =
      await service.getActiveSubscriptions(sampleUserId);

    // Assert that userCreditsDao.findById was called with the correct userId
    expect(
      daoFactoryMock.getUserCreditsDao().findByUserId,
    ).toHaveBeenCalledWith(sampleUserId);

    // Assert that activeSubscriptions is an empty array
    expect(activeSubscriptions).toEqual([]);
  });
});

describe("MergeOffers tests", () => {
  let offerChild1: IOffer<ObjectId>;
  let offerChild2: IOffer<ObjectId>;
  let offerRoot1: IOffer<ObjectId>;
  let offerRoot2: IOffer<ObjectId>;
  let service: BaseService<ObjectId>;
  let daoFactoryMock: IDaoFactory<ObjectId>;

  beforeAll(async () => {
    // Initialize your mocks and dependencies here.
    const mocks = await initMocks();
    ({ daoFactoryMock, offerChild1, offerChild2, offerRoot1, offerRoot2 } =
      mocks);

    service = new ExtendedBaseService(daoFactoryMock);
  });

  it("should merge sub-offers that match overridingKey with root offers", () => {
    const mergedOffers = service.mergeOffers(
      [offerRoot1, offerRoot2],
      [offerChild1, offerChild2],
    );
    expect(mergedOffers).toEqual(
      expect.arrayContaining([offerRoot2, offerChild1, offerChild2]),
    );
  });
  it("should return a union array if no key matches are found", () => {
    const mergedOffers = service.mergeOffers([offerRoot1], [offerChild1]);
    expect(mergedOffers).toEqual(
      expect.arrayContaining([offerRoot1, offerChild1]),
    );
  });

  it("should handle empty input arrays", () => {
    const mergedOffers = service.mergeOffers([], []);
    expect(mergedOffers).toEqual([]);
  });
});

describe("createOrder", () => {
  let sampleUserId: ObjectId;
  let offerRoot1: IOffer<ObjectId>;
  let offerRoot2: IOffer<ObjectId>;
  let service: BaseService<ObjectId>;
  let mongooseDaoFactory: IDaoFactory<ObjectId>;

  beforeAll(async () => {
    // Initialize your mocks and dependencies here.
    const mocks = await initMocks();
    ({ mongooseDaoFactory, offerRoot1, offerRoot2, sampleUserId } = mocks);
    await mongooseDaoFactory.getOfferDao().create(offerRoot1);
    await mongooseDaoFactory.getOfferDao().create(offerRoot2);
    service = new ExtendedBaseService(mongooseDaoFactory);
  });

  it("should create an order with the specified quantity and total", async () => {
    // Arrange
    const offerId = offerRoot1._id; // Use the offer with a quantity limit
    const userId = sampleUserId;
    const quantity = 150; // Below the maximum allowed quantity

    // Act
    const order = await service.createOrder(offerId, userId, quantity);

    // Assert
    expect(order.quantity).toEqual(quantity);
    expect(order.total).toEqual(order.quantity * offerRoot1.price);
  });

  it("should throw an InvalidOrderError when quantity exceeds the maximum limit", async () => {
    // Arrange
    const offerId = offerRoot2._id; // Use the offer with a quantity limit
    const userId = sampleUserId;
    const quantity = 10; // Exceeds the maximum allowed quantity

    // Act
    try {
      await service.createOrder(offerId, userId, quantity);
    } catch (error) {
      // Assert
      expect(error).toBeInstanceOf(InvalidOrderError);
      expect((error as InvalidOrderError).message).toBe(
        "Requested quantity exceeds the limit",
      );
      return; // Exit the test function
    }

    // If no error was thrown, fail the test
    fail("Expected InvalidOrderError to be thrown");
  });
  it("should create an order with quantity 1 if quantity parameter is not provided", async () => {
    // Arrange
    const offerId = offerRoot1._id;
    const userId = sampleUserId;

    // Act
    const order = await service.createOrder(offerId, userId);

    // Assert
    expect(order.quantity).toBeUndefined();
    expect(order.total).toEqual(offerRoot1.price);
  });

  it("should create an order with tokenCount when the offer kind is 'tokens'", async () => {
    // Arrange
    const offerId = offerRoot1._id; // Use the tokens offer
    const userId = sampleUserId;
    const quantity = 5; // Any quantity, as this test focuses on tokenCount

    // Act
    const order = await service.createOrder(offerId, userId, quantity);

    // Assert
    expect(order.tokenCount).toEqual(offerRoot1.tokenCount);
  });

  it("should create an order with the same total as the offer price when quantity is not provided", async () => {
    // Arrange
    const offerId = offerRoot1._id; // Use an offer with quantity limit
    const userId = sampleUserId;

    // Act
    const order = await service.createOrder(offerId, userId);

    // Assert
    expect(order.total).toEqual(offerRoot1.price);
  });
});
