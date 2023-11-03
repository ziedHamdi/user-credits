import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

import type { IOfferDao } from "../../../../src/db/dao";
import type { IOffer } from "../../../../src/db/model";
import { MockBaseDao } from "./MockBaseDao";
import { IFindOffersParams } from "../../../../src/db/dao/IFindOffersParams";

export class MockOfferDao
  extends MockBaseDao<IOffer<ObjectId>>
  implements IOfferDao<ObjectId, IOffer<ObjectId>>
{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadSubGroupOffers(parentOfferGroup: string): Promise<IOffer<ObjectId>[]> {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadOffers(params: IFindOffersParams<ObjectId>): Promise<IOffer<ObjectId>[]> {
    return Promise.resolve([]);
  }
}
