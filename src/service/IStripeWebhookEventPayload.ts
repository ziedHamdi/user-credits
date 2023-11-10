import { IWebhookEventPayload } from "@user-credits/core";

export interface IStripeWebhookEventPayload extends IWebhookEventPayload {
  body: string;
  headers: {
    "stripe-signature": string;
    // Other header properties if necessary
  };
  // Other properties of the payload
}
