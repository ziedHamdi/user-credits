import { BaseEntity } from "./BaseEntity";

/**
 * @param K the type of foreign keys (is used for all foreign keys type)
 */
export interface ITokenTimetable<K extends object> extends BaseEntity<K> {
  createdAt: Date;
  tokens: number;
  userId: K;
}
