// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IMinimalId } from "../model";

export interface IFindOffersParams<K extends IMinimalId> {
  allTags?: boolean;
  offerGroup?: string;
  tags?: string[];
  unlockedBy?: string[];
}
