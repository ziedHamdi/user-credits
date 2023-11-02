import { Connection, Types } from "mongoose";

type ObjectId = Types.ObjectId;

import type { IFindOffersParams, IOfferDao } from "../../../db/dao/IOfferDao";
import type { IOffer } from "../../../db/model";
import { Offer } from "../model";
import type { IMongooseOffer } from "../model/Offer";
import { BaseMongooseDao } from "./BaseMongooseDao";

export class OfferDao
  extends BaseMongooseDao<IMongooseOffer, IOffer<ObjectId>>
  implements IOfferDao<ObjectId, IMongooseOffer>
{
  constructor(connection: Connection) {
    super(connection, Offer, "offer");
  }

  async loadTaggedOffers(tags: string[]): Promise<IMongooseOffer[]> {
    return this.find({ tags: { $all: tags } });
  }

  async loadSubOffers(parentOfferId: ObjectId): Promise<IMongooseOffer[]> {
    // Use find() to get sub-offers based on _id and parentOfferId
    return this.find({ parentOfferId });
  }

  async loadSubGroupOffers(
    parentOfferGroup: string,
  ): Promise<IMongooseOffer[]> {
    // Use find() to get sub-offers based on offerGroup and parentOfferGroup
    return this.find({ parentOfferGroup });
  }

  async loadOffers(
    params: IFindOffersParams<ObjectId>,
  ): Promise<IMongooseOffer[]> {
    const query = {} as unknown as IOffer<ObjectId>;

    if (params.offerGroup) {
      query.offerGroup = params.offerGroup;
    }

    if (params.purchasedOfferGroups) {
      query.unlockedBy = {
        $in: params.purchasedOfferGroups,
      } as unknown as string[]; // needed cast to use $in
    }

    if (params.allTags) {
      // Use $all operator to match all provided tags
      query.tags = { $all: params.tags } as unknown as string[]; // obliged to ignore
    } else {
      // Use $in operator to match any of the provided tags
      query.tags = { $in: params.tags } as unknown as string[]; // obliged to ignore
    }

    return this.find(query);
  }
}
