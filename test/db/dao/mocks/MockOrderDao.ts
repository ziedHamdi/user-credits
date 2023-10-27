import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

import { IOrderDao } from "../../../../src/db/dao"; // Import the actual path
import { IOrder } from "../../../../src/db/model"; // Import the actual path
import { MockBaseDao } from "./MockBaseDao";

export class MockOrderDao
  extends MockBaseDao<IOrder<ObjectId>>
  implements IOrderDao<ObjectId, IOrder<ObjectId>>
{
  constructor(sampleDTO: IOrder<ObjectId>) {
    super(sampleDTO);
  }
}
