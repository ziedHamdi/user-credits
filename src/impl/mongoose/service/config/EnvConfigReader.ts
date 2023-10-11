import dotenv from "dotenv";

import { IConfigReader } from "../../../../service/config/IConfigReader";

dotenv.config(); // Load environment variables from a .env file

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

  get paymentApiVersion(): string {
    return this.apiVersion;
  }

  get paymentPublicKey(): string {
    return this.publicKey;
  }

  get paymentSecretKey(): string {
    return this.privateKey;
  }

  get currency(): string {
    return this.defaultCurrency;
  }
}
