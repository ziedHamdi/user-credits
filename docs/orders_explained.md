[< Previous: offer loading explained](/docs/offer_loading_explained.md)

# Purchasing Offers and Managing User Credits

In this section, we delve into the process of a customer selecting and purchasing an offer and explore the subsequent changes in persisted data.

## Purchasing an Offer

To initiate a purchase, the interface method `createOrder` is used. This method is straightforward and creates an order for a user from a selected offer, saving the user's intention to purchase the offer. Here's the method signature:

```typescript
/**
 * Creates an order for a user from a selected offer, saving the user's intention to purchase the offer.
 *
 * @param offerId The unique identifier of the selected offer.
 * @param userId The unique identifier of the user initiating the order.
 * @returns A promise that resolves to the created order.
 */
createOrder(offerId: unknown, userId: unknown): Promise<IOrder<K>>;
```

> One question that may arise is whether we allow the user to purchase an offer they haven't unlocked. As of now, the answer is yes, but it's important to note that the library is still evolving. If this level of control is critical for your use case, you can implement it in your code or contribute by submitting a pull request to share the feature with others.

When the `createOrder` method is called, it first checks if it knows the user (customer) by searching for an entry in the UserCredits collection for that userId. At most one entry per userId is allowed in that collection. If the user is not found, an entry is created for their first purchase intention.

It's worth noting that we refer to the subscription to an offer as a "purchase," even if the offer is free, as it may unlock other offers. We'll discuss executing an order without payment later.

## User Credits Data

A user's credits are maintained in two lists: `ISubscription` and `IActivatedOffer` paired with his `userId`. In our case, we're primarily interested in `ISubscription`, which represents the intention to purchase an offer. Once the offer is paid, it becomes an active subscription and is moved to the list of `IActivatedOffer`.

Here's the interface for `ISubscription`:

```typescript
import { IBaseEntity, IOfferCycle, IMinimalId } from "@user-credits/core";

/**
 * Interface representing a subscription.
 * @param K - The type of foreign keys (used for all foreign key types).
 */
export interface ISubscription<K extends IMinimalId> extends IBaseEntity<K> {
  /**
   * The custom cycle duration in seconds, only applicable when cycle is 'custom'.
   */
  customCycle: number | null;

  /**
   * The cycle of the subscription (e.g., 'once', 'weekly', 'monthly', etc.).
   */
  cycle: IOfferCycle;

  /**
   * The name of the subscription.
   */
  name: string;

  /**
   * The grouping of offers belonging to the same service.
   * Example: "Mobile TV Basic" offer with multiple subscription options.
   */
  offerGroup: string[];

  /**
   * The foreign key of the associated offer.
   */
  offerId: K;

  /**
   * The foreign key of the associated order.
   */
  orderId: K;

  /**
   * The start date of the subscription.
   */
  starts: Date;

  /**
   * The status of the subscription, which can be 'pending', 'paid', 'refused', or 'error'.
   */
  status: "pending" | "paid" | "refused" | "error" | "inconsistent" | "partial" | "expired";

  /**
   * The number of tokens associated with the subscription.
   */
  tokens: number;
}
```

The `ISubscription` data essentially copies information about the order it's linked to, along with details from the offer, including the `offerGroup` list value. It includes a `status` field, which can have one of the values "pending," "paid," "refused," or "error." These fields are used when a user views their ongoing payments or their list of active, unpaid, and past orders. Duplicating this data offers the advantage of retrieving information with a single database access.

On the other hand, an active offer is one that has been paid for, has remaining tokens, and has not yet expired. It is represented by the `IActivatedOffer` interface:

```typescript
/**
 * Interface representing an activated offer.
 */
export interface IActivatedOffer {
  /**
   * The expiry date of the activated offer.
   */
  expires: Date;

  /**
   * The grouping of offers to which this offer belongs.
   */
  offerGroup: string[];

  /**
   * The start date of the activated offer.
   */
  starts: Date;

  /**
   * The number of tokens associated with the activated offer.
   */
  tokens: number;
}
```

## Orders and Offer Data

An Order (pointing to the selected offer) is also created along with the UserCredits entry, and it is its id that is saved in the `ISubscription` we were talking about.

Let's see how an Order looks:

```typescript
/**
 * @param K the type of foreign keys (is used for all foreign keys type)
 */
export interface IOrder<K extends MinimalId> extends BaseEntity<K> {
  country: string | null;
  createdAt: Date;
  currency: string;
  customCycle: number | null;
  cycle: IOfferCycle;
  history: [IOrderStatus] | null;
  /** Check documentation in @IOffer */
  offerGroup: string[];
  offerId: K;
  /**
   * This field value can change if an intent is abandoned: a new intent can be created to complete the payment.
   */
  paymentIntentId: string | null;
  /**
   * This field is not saved to db, it only carries info during the session
   */
  paymentIntentSecret: string | null;
  quantity: number;
  status: "pending" | "paid" | "refused" | "error" | "inconsistent" | "partial" | "expired";
  taxRate: number | null;
  tokenCount: number | null;
  total: number;
  updatedAt: Date;
  userId: K;
}
```

Even though data is copied to an `ISubscription` item in the UserCredits, it's the Offer that represents the single source of truth in the user-credits library. The Offer even copies data from the offer at the moment of its creation to avoid conflictual situations where the Offer price or other data would have changed, ensuring a record of what the customer bought. It's crucial to maintain data integrity, especially when handling customer payments. This includes preserving information like the country the customer paid from, the paymentIntent foreign id (referring to the Stripe or other platform intentId), and data for such checks.

### IOffer is (almost) entirely copied to the order
The token count and expiry date are computed at the stage of creation to fix what offer data the user picked at the moment they expressed their intention to purchase. It is computed again using the saved data from the offer when the Order is activated by a payment.

### The history field
Finally, an interesting field to trace the history of the purchase order is `history`: an array of `OrderStatus` items. An `OrderStatus` consists of a date of status change, a human-readable message explaining what happened, and a status.

Here's the interface for `OrderStatus`:

```typescript
export interface IOrderStatus {
  date: Date;
  message: string;
  status: "pending" | "paid" | "refused" | "error" | "inconsistent" | "partial" | "expired";
}
```

In summary, when a customer decides to purchase an offer, the `createOrder` method is used, and data is updated to reflect the intention to purchase in the form of an `ISubscription`. Once the payment is made, the offer transitions to an active state as an `IActivatedOffer`. This mechanism forms the core of the user credits system, allowing for smooth management of subscriptions and offers.

[< Previous: offer loading explained](/docs/offer_loading_explained.md)
