import mongoose, { ConnectOptions, disconnect, Mongoose } from "mongoose";

let connected: Mongoose | unknown;

export async function connectToDb(uri: string, dbName: string) {
  if (connected) throw new Error("Already connected to mongoose");

  if (!uri || !dbName) {
    throw new Error("Please please specify db uri and/or name");
  }

  connected = (await mongoose.connect(uri, {
    dbName,
  } as ConnectOptions) as Mongoose);
}

export async function disconnectFromDb() {
  await disconnect();
  connected = null;
}
