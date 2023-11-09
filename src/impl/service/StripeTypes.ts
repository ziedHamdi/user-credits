/**
 * This interfaces allow abstracting out Stripe to allow Mocks to be used instead with Awilix
 */

/* eslint-disable*/
export type PaymentIntentsCreate = (params: object) => Promise<never>;
export type PaymentIntentsRetrieve = (paymentIntentId: string) => Promise<never>;
export type ConstructEvent = (rawBody: string, sig: string, secret: string) => never;
/* eslint-enable*/

export interface StripeTypes {
  paymentIntents: {
    create: PaymentIntentsCreate;
    retrieve: PaymentIntentsRetrieve;
  };
  webhooks: {
    constructEvent: ConstructEvent;
  };
}
