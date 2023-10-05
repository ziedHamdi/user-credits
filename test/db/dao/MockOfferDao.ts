import { Types } from "mongoose"; type ObjectId = Types.ObjectId;

import { IOfferDao } from "../../../src/db/dao";
import { IOffer } from "../../../src/db/model";
import { MockBaseDao } from "./MockBaseDao";

export class MockOfferDao
  extends MockBaseDao<IOffer<ObjectId>, MockOfferDao>
  implements IOfferDao<ObjectId, IOffer<ObjectId>>
{
  constructor(
    sampleDTO: IOffer<ObjectId>,
  ) {
    super(sampleDTO);
  }
  public loadSubOffers = jest.fn(
    (): Promise<IOffer<ObjectId>[]> => Promise.resolve([]),
  );
}
