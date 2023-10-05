// setup.js
import { asValue } from "awilix";
import { MongoMemoryServer } from "mongodb-memory-server";

import { testContainer } from "../../test/testContainer";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  testContainer.register({
    mongoUri: asValue(uri), // Register it as a value dependency
  });

  // Use `uri` and `dbName` in your Awilix container setup.
  // Register them as constants or inject them as needed.
});

afterAll(async () => {
  await mongoServer.stop();
});
