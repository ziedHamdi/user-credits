// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IMinimalId } from "../model";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IFindOffersParams<K extends IMinimalId> {
  allTags?: boolean;
  offerGroup?: string;
  tags?: string[];
  unlockedBy?: string[];
}
