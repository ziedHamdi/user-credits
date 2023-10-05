import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

export default async () => {
  const mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  // Set up the MongoDB connection
  await mongoose.connect(uri, { useNewUrlParser: true });

  // Do any additional global setup if needed
};
