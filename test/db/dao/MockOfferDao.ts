import { ObjectId } from "bson";

import { IOfferDao } from "../../../src/db/dao";
import { IOffer } from "../../../src/db/model";
import { MockBaseDao } from "./MockBaseDao";

export class MockOfferDao
  extends MockBaseDao<IOffer<ObjectId>, MockOfferDao>
  implements IOfferDao<ObjectId, IOffer<ObjectId>>
{
  constructor(
    sampleDTO: IOffer<ObjectId>,
    overrides: Partial<MockOfferDao> | null,
  ) {
    super(sampleDTO, overrides);
  }

  async loadSubOffers(parentOfferId: ObjectId): Promise<IOffer<ObjectId>[]> {
    if (this.mockFunctions.loadSubOffers) {
      return this.mockFunctions.loadSubOffers(parentOfferId);
    }
    // Provide a default implementation or throw an error if needed
    throw new Error("loadSubOffers not implemented in mock.");
  }
}
