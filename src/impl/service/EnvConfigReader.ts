import dotenv from "dotenv";

import { IConfigReader } from "../../service/config/IConfigReader";

dotenv.config(); // Load environment variables from a .env file

/**
 * This is one possible implementation for configuration reading.
 * If your project doesn't read environment variables from .env, feel free to implement your own IConfigReader and store
 * it as <code>configReader</code> in the Awilix container.
 */
export class EnvConfigReader implements IConfigReader {
  private readonly defaultCurrency: string;
  private readonly apiVersion: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly _dbUrl: string;
  private readonly _dbName: string;

  constructor() {
    this.publicKey = process.env.STRIPE_PUBLIC_KEY || "";
    this.privateKey = process.env.STRIPE_PRIVATE_KEY || "";
    this.apiVersion = process.env.STRIPE_API_VERSION || "2023-08-16";
    this.defaultCurrency = process.env.CURRENCY || "usd";
    this._dbName = process.env.DB_NAME || "user-credits";
    this._dbUrl = process.env.DB_URL || "mongodb://localhost:27001";
  }
  get dbUrl(): string {
    return this._dbUrl;
  }

  get dbName(): string {
    return this._dbName;
  }

  get currency(): string {
    return this.defaultCurrency;
  }

  get paymentApiVersion(): string {
    return this.apiVersion;
  }

  get paymentPublicKey(): string {
    return this.publicKey;
  }

  get paymentSecretKey(): string {
    return this.privateKey;
  }
}
