import { IBaseEntity } from "./IBaseEntity";
import { IMinimalId } from "./IMinimalId";

/**
 * @param K the type of foreign keys (is used for all foreign keys type)
 */
export interface ITokenTimetable<K extends IMinimalId> extends IBaseEntity<K> {
  createdAt: Date;
  tokens: number;
  userId: K;
}
