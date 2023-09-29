/**
 * @param K the type of foreign keys (is used for all foreign keys type)
 */
export interface ITokenTimetable<K extends object> {
  createdAt: Date;
  tokens: number;
  userId: K;
}
