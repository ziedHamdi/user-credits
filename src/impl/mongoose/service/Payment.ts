import { Types } from "mongoose";

type ObjectId = Types.ObjectId;

import { IDaoFactory } from "../../../db/dao";
import { IOffer, IOrder, ISubscription, IUserCredits } from "../../../db/model";
import { IActivatedOffer } from "../../../db/model/IUserCredits";
import { EntityNotFoundError, PaymentError } from "../../../errors";
import { BaseService } from "../../../service/BaseService";
import { IPaymentClient } from "../../../service/IPaymentClient";

export class Payment extends BaseService<ObjectId> {
  constructor(
    daoFactory: IDaoFactory<ObjectId>,
    protected paymentClient: IPaymentClient<ObjectId>,
  ) {
    super(daoFactory);
  }

  async execute(order: IOrder<ObjectId>): Promise<IUserCredits<ObjectId>> {
    // Retrieve user credits
    const userCredits: IUserCredits<ObjectId> = await this.getUserCredits(
      order.userId,
    );

    // Execute the payment and get the updated order
    const updatedOrder: IOrder<ObjectId> =
      await this.paymentClient.executePayment(order);

    // Update the subscription
    this.updateSubscription(userCredits, updatedOrder);

    // Save the changes to user credits
    userCredits.markModified("offers");
    await userCredits.save();

    return userCredits;
  }

  protected updateSubscription(
    userCredits: IUserCredits<ObjectId>,
    updatedOrder: IOrder<ObjectId>,
  ): IActivatedOffer | null {
    const existingSubscription: ISubscription<ObjectId> =
      userCredits.subscriptions.find(
        (subscription) => subscription.orderId === updatedOrder._id,
      ) as ISubscription<ObjectId>;

    if (!existingSubscription) {
      throw new PaymentError(
        `Illegal state: userCredits(${userCredits._id}) has no subscription for orderId (${updatedOrder._id}).`,
      );
    }

    existingSubscription.status = updatedOrder.status;

    if (updatedOrder.status === "paid") {
      // Payment was successful, increment the user's offer tokens
      existingSubscription.tokens += updatedOrder.tokenCount || 0;
      // Modify the offer object as needed
      const offer: IActivatedOffer = this.updateOffer(
        userCredits,
        updatedOrder,
      );
      return offer;
    }
    return null;
  }

  private updateOffer(
    userCredits: IUserCredits<ObjectId>,
    order: IOrder<ObjectId>,
  ): IActivatedOffer {
    const currentDate = new Date();

    const existingOfferIndex = userCredits.offers.findIndex(
      (offer: IActivatedOffer) => offer.offerGroup === order.offerGroup,
    );

    if (existingOfferIndex !== -1) {
      // Update the existing offer with the new information
      const existingOffer = userCredits.offers[existingOfferIndex];
      existingOffer.expires = this.calculateExpiryDate(
        existingOffer.expires,
        order.cycle,
      );
      existingOffer.tokens += order.tokenCount || 0;
    } else {
      // Create a new offer if not found
      const newOffer: IActivatedOffer = {
        expires: this.calculateExpiryDate(currentDate, order.cycle),
        offerGroup: order.offerGroup,
        starts: currentDate,
        tokens: order.tokenCount || 0,
      };
      userCredits.offers.push(newOffer);
    }

    return existingOffer;
  }

  async orderStatusChanged(
    orderId: ObjectId,
    status: "pending" | "paid" | "refused",
  ): Promise<IOrder<ObjectId>> {
    const order: null | IOrder<ObjectId> =
      await this.orderDao.findById(orderId);
    if (!order) throw new EntityNotFoundError("IOrder", orderId);
    order.status = status;
    await order.save();
    return order as IOrder<ObjectId>;
  }

  async remainingTokens(userId: ObjectId): Promise<IUserCredits<ObjectId>> {
    const userCredits: null | IUserCredits<ObjectId> =
      await this.userCreditsDao.findOne({ userId });
    if (!userCredits) throw new EntityNotFoundError("IUserCredits", userId);
    return userCredits;
  }
}
