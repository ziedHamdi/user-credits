import { Connection, Types } from "mongoose";

type ObjectId = Types.ObjectId;

import { IFindOffersParams, IOffer, IOfferDao } from "@user-credits/core";

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

  async loadOffersUnlockedByGroup(
    unlockedBy: string,
  ): Promise<IMongooseOffer[]> {
    // Use find() to get sub-offers based on offerGroup and parentOfferGroup
    return this.find({ unlockedBy });
  }

  async loadOffers(
    params: IFindOffersParams<ObjectId> = {},
  ): Promise<IMongooseOffer[]> {
    const query = {} as unknown as IOffer<ObjectId>;

    if (params.offerGroup) {
      query.offerGroup = params.offerGroup;
    }

    if (params.unlockedBy) {
      query.unlockedBy = {
        $in: params.unlockedBy,
      } as unknown as string[]; // needed cast to use $in
    }

    if (params.tags) {
      if (params.allTags) {
        // Use $all operator to match all provided tags
        query.tags = { $all: params.tags } as unknown as string[]; // obliged to ignore
      } else {
        // Use $in operator to match any of the provided tags
        query.tags = { $in: params.tags } as unknown as string[]; // obliged to ignore
      }
    }
    return this.find(query);
  }
}
