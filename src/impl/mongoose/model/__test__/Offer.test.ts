// offerModel.test.js
import mongoose, { Model } from "mongoose";

import type { IOffer } from "../../../../db/model";
import { ObjectId } from "../../TypeDefs";
import { Offer } from "../index";

describe("asUnlockingOfferGroups method", () => {
  it("should correctly attribute dependent offers, add other groups if called again without second argument, but reset and restart if set to true", () => {
    // Mock the method to avoid database interaction

    const OfferModel: Model<IOffer<ObjectId>> = mongoose.model(
      "Offer",
      Offer,
    ) as unknown as Model<IOffer<ObjectId>>;
    const offer = new OfferModel();
    // offer.asUnlockingOfferGroups = jest.fn();

    const result = offer.asUnlockingOfferGroups([
      "ABC",
      "ABC",
      "DEF",
      "GHI",
      "DEF",
    ]);

    expect(result).toEqual(expect.arrayContaining(["ABC", "DEF", "GHI"]));
    expect(result).toEqual(offer.unlockedBy);

    offer.asUnlockingOfferGroups(["JKL"]);
    expect(offer.unlockedBy).toEqual(
      expect.arrayContaining(["ABC", "DEF", "GHI", "JKL"]),
    );

    //reset
    offer.asUnlockingOfferGroups(["JKL"], true);
    expect(offer.unlockedBy).toEqual(["JKL"]);
  });

  // Add more test cases as needed
});

describe("asUnlockingOffers method", () => {
  it("should correctly attribute dependent offers, add update the unlocking offers' hasDependentOffers the value 'true'", () => {
    // Mock the method to avoid database interaction

    const OfferModel: Model<IOffer<ObjectId>> = mongoose.model(
      "Offer",
      Offer,
    ) as unknown as Model<IOffer<ObjectId>>;
    const offer = new OfferModel();
    const offersToUpadte = [
      { offerGroup: "ONE" },
      { offerGroup: "TWO" },
      { offerGroup: "THREE" },
    ] as IOffer<ObjectId>[];

    const result = offer.asUnlockingOffers(offersToUpadte);

    expect(result).toEqual(expect.arrayContaining(["ONE", "TWO", "THREE"]));
    expect(result).toEqual(offer.unlockedBy);
    offersToUpadte.forEach((offerItem) =>
      expect(offerItem.hasDependentOffers).toBe(true),
    );

    const four = { offerGroup: "FOUR" };
    offer.asUnlockingOffers([four] as IOffer<ObjectId>[]);
    expect(offer.unlockedBy).toEqual(
      expect.arrayContaining(["ONE", "TWO", "THREE", "FOUR"]),
    );

    //reset
    offer.asUnlockingOffers([four] as IOffer<ObjectId>[], true);
    expect(offer.unlockedBy).toEqual(["FOUR"]);
  });

  // Add more test cases as needed
});
