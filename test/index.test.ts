beforeAll(() => {
});

describe("add function", () => {
  it("should return 123 given 123", () => {
    expect(add(123)).toBe(123);
  });

  it("should return 3 given 1, 2", () => {
    expect(add(1, 2)).toBe(3);
  });

  it("should return 3 given 2, 1", () => {
    expect(add(2, 1)).toBe(3);
  });

  it("should return 36 given -5, 2, 39", () => {
    expect(add(-5, 2, 39)).toBe(36);
  });

  it("should not return 3 given 1, 1", () => {
    expect(add(1, 1)).not.toBe(3);
  });

  it("should throw an error given no argument", () => {
    expect(() => add()).toThrow(
      new Error("At least one number argument must be provided!"),
    );
  });
});
