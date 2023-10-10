//NODE: these imports are a temporary workaround to avoid the warning: "Corresponding file is not included in tsconfig.json"
import { afterAll, beforeAll, beforeEach, describe, it } from "@jest/globals";
import expect from "expect";

import { IDaoFactory } from "../../src/db/dao"; // Import the actual path
import { IOffer, ISubscription, IUserCredits } from "../../src/db/model"; // Import the actual path
import { BaseService } from "../../src/service/BaseService";
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
import { toHaveSameFields } from "../extend/sameObjects";
import { initMocks, kill, ObjectId } from "./mocks/BaseService.mocks";

describe("BaseService.getActiveSubscriptions", () => {
  let daoFactoryMock: IDaoFactory<ObjectId>;
  let sampleUserId: ObjectId;
  let subscriptionPaid1: ISubscription<ObjectId>;
  let subscriptionPending1: ISubscription<ObjectId>;
  let subscriptionRefused1: ISubscription<ObjectId>;
  let sampleUserCredits: IUserCredits<ObjectId>;

  beforeAll(async () => {
    // Initialize your mocks and dependencies here.
    const mocks = await initMocks();
    ({
      daoFactoryMock,
      sampleUserId,
      subscriptionPaid1,
      subscriptionPending1,
      subscriptionRefused1,
    } = mocks);
    sampleUserCredits = {
      subscriptions: [subscriptionPaid1, subscriptionPending1], // Use the created instances
      tokens: 100, // Sample token balance
      userId: sampleUserId,
    } as IUserCredits<ObjectId>;
  });

  afterAll(async () => {
    await kill();
  });

  let service: BaseService<ObjectId>;

  beforeEach(() => {
    // Create a new instance of BaseService with the mock userCreditsDao
    service = new BaseService<ObjectId>(daoFactoryMock);

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
      subscriptions: [subscriptionPending1, subscriptionRefused1],
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

    service = new BaseService<ObjectId>(daoFactoryMock);
  });

  afterAll(async () => {
    await kill();
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
