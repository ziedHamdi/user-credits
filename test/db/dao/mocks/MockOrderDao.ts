import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

import { IOrder, IOrderDao } from "@user-credits/core"; // Import the actual path

import { MockBaseDao } from "./MockBaseDao";

export class MockOrderDao
  extends MockBaseDao<IOrder<ObjectId>>
  implements IOrderDao<ObjectId, IOrder<ObjectId>>
{
  constructor(sampleDTO: IOrder<ObjectId>) {
    super(sampleDTO);
  }
}
