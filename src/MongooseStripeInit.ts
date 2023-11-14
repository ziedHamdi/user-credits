import { IMinimalId } from "@user-credits/core";
import { asClass, asValue, createContainer } from "awilix";
import { AwilixContainer } from "awilix/lib/container";
import Stripe from "stripe";

import { EXPECTED_PROPERTIES } from "./Constants";
// import { MongooseDaoFactory } from "./impl/mongoose/dao/MongooseDaoFactory";
import { EnvConfigReader } from "./impl/service/EnvConfigReader";
import { StripeClient } from "./impl/service/StripeClient";
import { StripeTypes } from "./impl/service/StripeTypes";
import { IConfigReader } from "./service";
import { checkContainer } from "./util/AwilixConfigChecker";

export class MongooseStripeContainerSingleton {
  private static container: AwilixContainer<object>;
  private static active: boolean = false;

  private constructor() {
    // Private constructor to prevent external instantiation
  }

  public static async getInstance(): Promise<AwilixContainer<object>> {
    if (MongooseStripeContainerSingleton.active) return this.container;
    this.active = true;
    this.container = createContainer();

    // FIXME must adapt to new constructor of MongooseDaoFactory
    // this.container.register({
    //   daoFactory: asFunction(() => new MongooseDaoFactory()),
    // });

    this.container.register({
      configReader: asClass(EnvConfigReader).singleton(),
    });
    const configReader: IConfigReader = this.container.resolve("configReader");
    const stripe = new Stripe(configReader.paymentSecretKey, {
      apiVersion: "2023-08-16",
    }) as unknown as StripeTypes;
    this.container.register({
      stripe: asValue(stripe),
    });
    const stripeClient = new StripeClient(configReader, stripe);
    this.container.register({
      stripeClient: asValue(stripeClient),
    });
    this.container.register({ currency: asValue("usd") });

    return this.container;
  }

  public static async stop() {
    // const mongoServer: MongoMemoryServer = TestContainerSingleton.container.resolve("mongoServer") as MongoMemoryServer;
    // TestContainerSingleton.active = await mongoServer.stop(true);
  }
}

export async function resolveConfigReader(): Promise<IConfigReader> {
  return (await MongooseStripeContainerSingleton.getInstance()).resolve(
    "configReader",
  );
}
export async function resolveStripe(): Promise<Stripe> {
  return (await MongooseStripeContainerSingleton.getInstance()).resolve(
    "stripe",
  );
}
export async function resolveStripeClient<K extends IMinimalId>(): Promise<
  StripeClient<K>
> {
  return (await MongooseStripeContainerSingleton.getInstance()).resolve(
    "stripeClient",
  );
}

async function check(): Promise<boolean> {
  const isContainerValid = checkContainer(
    await MongooseStripeContainerSingleton.getInstance(),
    EXPECTED_PROPERTIES,
  );
  return isContainerValid;
}

check().catch((err) =>
  console.error("Failed to launch Mongoose-Stripe IOC Container", err),
);
