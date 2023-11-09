import { asClass, asValue, createContainer } from "awilix";
import { AwilixContainer } from "awilix/lib/container";
import { Stripe } from "stripe";

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
    const configReader: IConfigReader = this.container.resolve(EnvConfigReader);
    const stripe = new Stripe(configReader.paymentSecretKey(), {
      apiVersion: "2023-08-16",
    }) as StripeTypes;
    this.container.register({
      stripe: asValue(stripe),
    });
    this.container.register({
      stripeClient: asClass(StripeClient).singleton(),
    });
    this.container.register({ defaultCurrency: asValue("usd") });

    return this.container;
  }

  public static async stop() {
    // const mongoServer: MongoMemoryServer = TestContainerSingleton.container.resolve("mongoServer") as MongoMemoryServer;
    // TestContainerSingleton.active = await mongoServer.stop(true);
  }
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
