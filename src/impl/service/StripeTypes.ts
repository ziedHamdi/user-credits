/**
 * This interfaces allow abstracting out Stripe to allow Mocks to be used instead with Awilix
 */

/* eslint-disable*/
export interface StripeIntent {
  amount_received: string;
  id: string;
  client_secret: string;
  currency: string;
  next_action: string;
  status: string;
  last_payment_error: {
    code: string;
    message: string;
    type: string;
  }
}
export type PaymentIntentsCreate = (params: object) => Promise<StripeIntent>;
export type PaymentIntentsRetrieve = (paymentIntentId: string) => Promise<StripeIntent>;
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
