/* global beforeAll, console, afterAll, expect */
// setupBeforeAll.js

beforeAll(async () => {

});

afterAll(async () => {
  // FIXME uncomment the following line: it's commented to allow us to connect and check the db for now
  // await mongoServer.stop();
});

// Define a Jest utility function to compare objects field by field
expect.extend({
  toHaveSameFields(received, expected) {
    const receivedKeys = Object.keys(received);
    const expectedKeys = Object.keys(expected);

    // Check if the number of fields is the same
    if (receivedKeys.length !== expectedKeys.length) {
      return {
        message: () => `Expected objects to have the same number of fields.`,
        pass: false,
      };
    }

    const differences = [];

    // Compare fields and their values
    for (const key of receivedKeys) {
      const receivedValue = received[key];
      const expectedValue = expected[key];

      if (receivedValue !== expectedValue) {
        differences.push(key);
      }
    }

    // Determine if the objects have the same fields
    const pass = differences.length === 0;

    const message = pass
      ? () => `Expected objects not to have the same fields.`
      : () =>
          `Expected objects to have the same fields, but found differences in: ${differences.join(
            ", ",
          )}.`;

    return {
      message,
      pass,
    };
  },
});
