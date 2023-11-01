import { IMinimalId } from "../model";
import { ITokenTimetable } from "../model/ITokenTimetable";
import { IBaseDao } from "./IBaseDao";

export interface ITokenTimetableDao<
  K extends IMinimalId,
  D extends ITokenTimetable<K>,
> extends IBaseDao<D> {}
