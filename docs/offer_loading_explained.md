# Unlocking Offers and Managing Overrides

In the world of UserCredits, the journey continues as we delve into the fascinating realm of orders. If you're just joining us, we recommend reading our previous article on orders to get up to speed: [UserCredits - Understanding Orders](/docs/offers_explained.md).

[user-credits](https://github.com/ziedHamdi/UserCredits) is not merely about organizing your offers; it covers every facet of user credits, encompassing pay-as-you-go models, payment screens, UI libraries like [svelte-user-credits](https://github.com/ziedHamdi/svelte-user-credits), and more. In this section, we'll explore the services available for purchasing offers, gaining insights into purchased and ongoing offers, unlocking advantageous deals, and even executing purchases outside the realm of payment gateways through manual validation.

## UserCredits Service Facade

The UserCredits service facade provides an essential interface for interacting with the UserCredits library. However, it's essential to note that this library does not handle authentication or authorization. It assumes that user permissions and rules have been thoroughly validated in your secure and controlled environment before executing any calls. We will start with the advanced offer listing method. 

```typescript
import { IDaoFactory } from "../db/dao";
import { IOffer, IOrder, MinimalId } from "../db/model";
import { IUserCredits } from "../db/model/IUserCredits";

/**
 * The main interface for the UserCredits library, allowing clients to interact with pay-as-you-go features.
 *
 * ⚠️ **WARNING:** Before using any of these methods, ensure that you have thoroughly checked and validated user
 * permissions and rules. This documentation assumes that you are in a secure and controlled environment when executing
 * these calls.
 *
 * @param K The type of foreign keys used throughout the library.
 */
export interface IService<K extends MinimalId> {
  // ... Other methods ...

  /**
   * Retrieves a list of offers and user-exclusive offers based on a user's unique identifier.
   * Exclusive offers become visible to users after they purchase a basic offer with the status 'paid'.
   * Exclusive offers can be overridden by other purchased offers using the `overridingKey` and `weight` properties,
   * allowing for customization of pricing and duration.
   *
   * @param userId The unique identifier of the user.
   * @param envTags The environment tags used to filter offers.
   * @returns A promise that resolves to an array of offers available to the user.
   */
  loadOffers(userId: unknown, envTags: string[]): Promise<IOffer<K>[]>;
}
```

### Important Note

> Before diving into the intricacies of the library, please keep in mind that UserCredits assumes user permissions and rules have been diligently validated before making any calls. It operates with user identifiers you provide, which need not be the actual database IDs, allowing you to map user identities for enhanced privacy and security.

## Narrowing Down Offers

The `loadOffers` method plays a pivotal role in narrowing down the available offers based on environmental tags. For instance, when the user toggles between Early Bird Yearly and Monthly subscriptions, it is respectively called with `envTags: ["Subscription", EarlyBird", "Yearly"]` and `envTags: ["Subscription", EarlyBird", "Monthly"]`.

However, this method goes a step further than a simple database query. It utilizes the provided user ID to access the user's "successfully" purchased offers (excluding pending or refused ones). Each of the offerGroup(s) in the "purchased Offers" is then used to locate all sub-offers with a parent having that parentOfferGroup. This design allows users to unlock all offers marked as children when they purchase a parent offer.

For a clearer understanding, consider the following example using our fictive startup, WonderAI. If you recall, purchasing an offer with the `offerGroup` labeled as "**EarlyBird**" will unlock both VIP offers, granting the customer the ability to speak at WonderAI events and showcase their company's perks on WonderAI's blog.

> Note that we are employing two distinct strategies here: one relies on tags to search for anonymous offers, while the other utilizes the provided `userId` to retrieve the user's purchased offers, including their associated `offerGroup` values. We use `parentOfferGroup=offerGroup` for each of these values to identify the children. It's important to differentiate between these concepts; tags are used for searches, while the relationship between `parentOfferGroup` and `offerGroup` is employed to unlock an offer hierarchy.

## Overriding

At this juncture, we possess two lists of offers: one corresponding to `envTags`, an (anonymous) list of offers. And a list of user-specific offers unlocked through their purchases, and we're ready to introduce two intriguing offer fields: `overridingKey` and `weight`.

Now, let's delve deeper into how these fields come into play. Any offer in the anonymous list can potentially be overridden by a purchase-unlocked offer. After all, the primary goal is to provide customers with better offers when they make a purchase, aiming to satisfy and retain them. An unlocked offer, which is user-unlocked and revealed through a purchase, recognizes its peer offer it is intended to override, and this is determined by the `overridingKey` field value. It's a one-on-one relationship: one offer can override at most one other offer.

> For instance, consider the "**/Standard/Enterprise/EventTalk**" offer, which can be overridden by its lower-priced counterpart, the "**/EarlyBird/EventTalk**" peer offer.

However, we can envision scenarios where multiple offers are unlocked by various `offerGroup` values from the user's purchased offers. These sub-offers may conflict with the same `overridingKey` value (with no parent-child relationship allowing a default overriding). 

### Weight
This is when the `weight` field comes into play, allowing for prioritization. Sub-offers with higher `weight` values take precedence. In cases where two conflicting offers have identical `weight` values, a warning message is recorded in the logs, indicating the conflicting offers' IDs. Nevertheless, one (_unpredictable_) of them is selected, and no error is raised, providing flexibility for users to make purchases even if the offer hierarchy is not yet fully refined.

