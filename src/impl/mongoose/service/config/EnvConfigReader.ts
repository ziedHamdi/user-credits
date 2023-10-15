import dotenv from "dotenv";

import { IConfigReader } from "../../../../service/config/IConfigReader";

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

  constructor() {
    this.publicKey = process.env.STRIPE_PUBLIC_KEY || "";
    this.privateKey = process.env.STRIPE_PRIVATE_KEY || "";
    this.apiVersion = process.env.STRIPE_API_VERSION || "2023-08-16";
    this.defaultCurrency = process.env.CURRENCY || "usd";
  }

  paymentApiVersion(): string {
    return this.apiVersion;
  }

  paymentPublicKey(): string {
    return this.publicKey;
  }

  paymentSecretKey(): string {
    return this.privateKey;
  }

  currency(): string {
    return this.defaultCurrency;
  }
}
