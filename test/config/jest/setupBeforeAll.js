// eslint-disable-next-line @typescript-eslint/no-unused-vars
/* global beforeAll, console, afterAll */
// setupBeforeAll.js

import { expect } from "@jest/globals";

import { toHaveSameFields } from "../../extend/sameObjects";

beforeAll(async () => {});

afterAll(async () => {
  // FIXME uncomment the following line: it's commented to allow us to connect and check the db for now
  // await mongoServer.stop();
});

// Define a Jest utility function to compare objects field by field
expect.extend({
  toHaveSameFields,
});
