import { DuplicateMatchesError } from "../../src";
import { copyFieldsWhenMatching } from "../../src/util/Copy";

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
});
