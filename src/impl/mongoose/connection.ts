import mongoose, { Connection, ConnectOptions, disconnect, Mongoose } from "mongoose";

let connected: Mongoose | unknown;
let dbUri: string | null;

/**
 * Calls the mongoose.connect method (that creates a unique connection to the db)
 * @param uri
 * @param dbName
 */
export async function connectToDb(
  uri: string,
  dbName: string,
): Promise<Connection> {
  if (connected) throw new Error("Already connected to mongoose");

  if (!uri || !dbName) {
    throw new Error("Please please specify db uri and/or name");
  }

  connected = (await mongoose.connect(uri, {
    dbName,
  } as ConnectOptions)) as Mongoose;
  dbUri = uri;
  return mongoose.connection;
}

export async function disconnectFromDb() {
  await disconnect();
  connected = null;
  dbUri = null;
}

export { dbUri };
