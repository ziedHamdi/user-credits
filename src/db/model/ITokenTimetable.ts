import { BaseEntity } from "./BaseEntity";
import { MinimalId } from "./MinimalId";

/**
 * @param K the type of foreign keys (is used for all foreign keys type)
 */
export interface ITokenTimetable<K extends MinimalId> extends BaseEntity<K> {
  createdAt: Date;
  tokens: number;
  userId: K;
}
