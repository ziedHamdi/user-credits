import { Connection, Types } from "mongoose";
type ObjectId = Types.ObjectId;

import {
  ConsumptionPerOfferGroup,
  ITokenTimetable,
  ITokenTimetableDao,
} from "@user-credits/core";

import { TokenTimetable } from "../model";
import { IMongooseTokenTimetable } from "../model/TokenTimetable";
import { BaseMongooseDao } from "./BaseMongooseDao";

export class TokenTimetableDao
  extends BaseMongooseDao<IMongooseTokenTimetable, ITokenTimetable<ObjectId>>
  implements ITokenTimetableDao<ObjectId, IMongooseTokenTimetable>
{
  constructor(connection: Connection) {
    super(connection, TokenTimetable, "token_timetable");
  }

  /* eslint-disable sort-keys-fix/sort-keys-fix */
  async consumptionInDateRange(
    offerGroup: string,
    startDate: Date,
    endDate: Date = new Date(),
  ): Promise<number> {
    const [result] = await this.model.aggregate([
      {
        $match: {
          offerGroup,
          createdAt: { $gte: startDate, $lt: endDate },
          tokens: { $lt: 0 }, // Select only negative tokens
        },
      },
      {
        $group: {
          _id: null, // group all in one result (without grouping)
          totalNegativeTokens: { $sum: "$tokens" },
        },
      },
    ]);
    return result.totalNegativeTokens;
  }

  async checkTokens(
    startDate: Date,
    endDate: Date = new Date(),
    negative: boolean = true,
  ): Promise<[ConsumptionPerOfferGroup]> {
    /* eslint-enable sort-keys-fix/sort-keys-fix */
    const match = {
      createdAt: { $gte: startDate, $lt: endDate },
    };

    if (negative) match.tokens = { $lt: 0 }; // Select only negative tokens

    const aggregate = this.model.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$offerGroup", // group results by offerGroup
          totalTokens: { $sum: "$tokens" },
        },
      },
    ]);

    return (await aggregate) as unknown as [ConsumptionPerOfferGroup];
  }
  /* eslint-enable sort-keys-fix/sort-keys-fix */
}
