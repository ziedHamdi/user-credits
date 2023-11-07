import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

import type { IOfferDao } from "../../../../src/db/dao";
import { IFindOffersParams } from "../../../../src/db/dao/IFindOffersParams";
import type { IOffer } from "../../../../src/db/model";
import { MockBaseDao } from "./MockBaseDao";

export class MockOfferDao
  extends MockBaseDao<IOffer<ObjectId>>
  implements IOfferDao<ObjectId, IOffer<ObjectId>>
{
  loadOffersUnlockedByGroup(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    parentOfferGroup: string,
  ): Promise<IOffer<ObjectId>[]> {
    return Promise.resolve([]);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadTaggedOffers(tags: string[]): Promise<IOffer<ObjectId>[]> {
    return Promise.resolve([]);
  }
  constructor(sampleDTO: IOffer<ObjectId>) {
    super(sampleDTO);
  }
  public loadSubOffers = jest.fn(
    (): Promise<IOffer<ObjectId>[]> => Promise.resolve([]),
  );

  loadOffers(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    params: IFindOffersParams<ObjectId> = {},
  ): Promise<IOffer<ObjectId>[]> {
    return Promise.resolve([]);
  }
}
