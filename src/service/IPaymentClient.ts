import { IOrder, IMinimalId } from "../db/model";

export interface WebhookEventPayload {
  body: string;
  headers: {
    "stripe-signature": string;
    // Other header properties if necessary
  };
  // Other properties of the payload
}
/**
 * Interface for a payment client that abstracts out payment operations, allowing the UserCredits library to remain
 * framework-agnostic.
 *
 * ⚠️ **WARNING:** Before using any of these methods, ensure that you have thoroughly checked and validated user
 * permissions and rules. This documentation assumes that you are in a secure and controlled environment when executing
 * these calls.
 * @param K The type of foreign keys (used for all foreign keys type).
 */
export interface IPaymentClient<K extends IMinimalId> {
  /**
   * This method is called by the UserCredits library after a payment has been executed, whether it was successful or not.
   * It allows the payment client to handle any post-payment logic.
   *
   * @param order The order resulting from a payment transaction.
   * @returns A promise that resolves to the updated order after payment execution.
   */
  afterPaymentExecuted(order: IOrder<K>): Promise<IOrder<K>>;

  /**
   * Checks the balance of a user with the specified unique identifier.
   * This method is used to determine the user's available tokens for making payments.
   *
   * @param userId The unique identifier of the user whose balance needs to be checked.
   * @returns A promise that resolves to the user's token balance.
   */
  checkUserBalance(userId: K): Promise<number>;

  /**
   * Creates a payment intent for an order. This method is used to initiate the payment process.
   *
   * @param order The order for which a payment intent should be created.
   * @returns A promise that resolves to the order with an associated payment intent, or null if the creation is unsuccessful.
   */
  createPaymentIntent(order: IOrder<K>): Promise<IOrder<K> | null>;

  /**
   * Fetches the balance of a user with the specified unique identifier.
   * This method is used to retrieve the user's current token balance.
   *
   * @param userId The unique identifier of the user whose balance needs to be fetched.
   * @returns A promise that resolves to the user's token balance.
   */
  fetchUserBalance(userId: K): Promise<number>;

  /**
   * Handles incoming webhook events from the payment platform.
   * This method allows the payment client to process webhook payloads and validate them using a webhook secret.
   *
   * @param eventPayload The payload of the incoming webhook event.
   * @param webhookSecret The secret key used for validating the webhook payload.
   */
  handleWebhook(eventPayload: WebhookEventPayload, webhookSecret: string): void;
}
