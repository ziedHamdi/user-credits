import { copyFieldsWhenMatching } from "@user-credits/core";

import { DuplicateMatchesError } from "../../src";

describe("copyIds function", () => {
  it("should copy _id from source to target", () => {
    const source = [{ _id: "1", orderId: "order1" }];
    const target = [{ _id: "2", orderId: "order1" }];

    const result = copyFieldsWhenMatching(
      source,
      target,
      ["orderId"],
      ["_id"],
      false,
    );

    expect(result).toEqual([{ _id: "1", orderId: "order1" }]);
  });

  it("should not allow multiple occurrences", () => {
    const source = [
      { _id: "1", orderId: "order1" },
      { _id: "2", orderId: "order1" },
    ];
    const target = [{ _id: "3", orderId: "order1" }];

    try {
      copyFieldsWhenMatching(source, target, ["orderId"], ["_id"], false);
    } catch (err) {
      expect(err).toBeInstanceOf(DuplicateMatchesError);
      const error = err as DuplicateMatchesError<typeof source>;
      expect(error.message).toEqual(
        "More than one match found for the source object.",
      );
      expect(error.duplicates).toEqual([
        { _id: "1", orderId: "order1" },
        { _id: "2", orderId: "order1" },
      ]);
    }
  });

  it("should allow multiple occurrences", () => {
    const source = [
      { _id: "1", orderId: "order1" },
      { _id: "2", orderId: "order1" },
    ];
    const target = [
      { _id: "3", orderId: "order1" },
      { _id: "4", orderId: "order1" },
    ];

    const result = copyFieldsWhenMatching(
      source,
      target,
      ["orderId"],
      ["_id"],
      true,
    );

    expect(result).toEqual([
      { _id: "2", orderId: "order1" },
      { _id: "2", orderId: "order1" },
    ]);
  });
  it("should copy multiple fields when matching", () => {
    const source = [
      { _id: "1", offerId: "offer1", orderId: "order1", status: "paid" },
      { _id: "2", offerId: "offer2", orderId: "order2", status: "paid" },
    ];
    const target = [
      { _id: "3", offerId: "offer1", orderId: "order1", status: "unpaid" },
      { _id: "4", offerId: "offer2", orderId: "order2", status: "unpaid" },
    ];

    const result = copyFieldsWhenMatching(
      source,
      target,
      ["orderId", "offerId"],
      ["_id", "status"],
      false,
    );

    expect(result).toEqual([
      { _id: "1", offerId: "offer1", orderId: "order1", status: "paid" },
      { _id: "2", offerId: "offer2", orderId: "order2", status: "paid" },
    ]);
  });

  it("should not allow multiple occurrences with multiple fields", () => {
    const source = [
      { _id: "1", offerId: "offer1", orderId: "order1", status: "paid" },
      { _id: "2", offerId: "offer1", orderId: "order1", status: "paid" },
    ];
    const target = [
      { _id: "3", offerId: "offer1", orderId: "order1", status: "unpaid" },
      { _id: "4", offerId: "offer1", orderId: "order1", status: "unpaid" },
    ];

    try {
      copyFieldsWhenMatching(
        source,
        target,
        ["orderId", "offerId"],
        ["_id", "status"],
        false,
      );
    } catch (err) {
      expect(err).toBeInstanceOf(DuplicateMatchesError);
      const error = err as DuplicateMatchesError<typeof source>;
      expect(error.message).toEqual(
        "More than one match found for the source object.",
      );
      expect(error.duplicates).toEqual([
        { _id: "3", offerId: "offer1", orderId: "order1", status: "unpaid" },
        { _id: "4", offerId: "offer1", orderId: "order1", status: "unpaid" },
      ]);
    }
  });

  it("should allow multiple occurrences with multiple fields", () => {
    const source = [
      { _id: "1", offerId: "offer1", orderId: "order1", status: "paid" },
      { _id: "2", offerId: "offer2", orderId: "order2", status: "paid" },
    ];
    const target = [
      { offerId: "offer1", orderId: "order1", status: "unpaid" },
      { offerId: "offer2", orderId: "order2", status: "refused" },
    ];

    const result = copyFieldsWhenMatching(
      source,
      target,
      ["orderId", "offerId"],
      ["_id", "status"],
      true,
    );

    expect(result).toEqual([
      { _id: "1", offerId: "offer1", orderId: "order1", status: "paid" },
      { _id: "2", offerId: "offer2", orderId: "order2", status: "paid" },
    ]);
  });

  it("should handle non-matching sources and targets", () => {
    const source = [
      { _id: "1", offerId: "offer1", orderId: "order1" },
      { _id: "2", offerId: "offer2", orderId: "order2" },
    ];
    const target = [
      { _id: "3", offerId: "offer3", orderId: "order3" },
      { _id: "4", offerId: "offer4", orderId: "order4" },
    ];

    const result = copyFieldsWhenMatching(
      source,
      target,
      ["orderId", "offerId"],
      ["_id"],
      false,
    );

    expect(result).toEqual([
      { _id: "3", offerId: "offer3", orderId: "order3" },
      { _id: "4", offerId: "offer4", orderId: "order4" },
    ]);
  });
});
