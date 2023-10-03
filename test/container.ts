// container.js
import { asFunction, createContainer } from "awilix";

import { MongooseDaoFactory } from "../src/impl/mongoose/dao/MongooseDaoFactory";

// Configuration parameters
const uri = "mongodb://localhost:27017"; // Replace with your MongoDB URI
const dbName = "your_database"; // Replace with your database name

const container = createContainer();

// Register MongooseModels as a transient value
container.register({
  daoFactory: asFunction(async () => {
    const db = new MongooseDaoFactory(uri, dbName);
    return await db.init();
  }),
});

export default container;
