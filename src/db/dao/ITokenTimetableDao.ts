import { MinimalId } from "../model";
import { ITokenTimetable } from "../model/ITokenTimetable";
import { IBaseDao } from "./IBaseDao";

export interface ITokenTimetableDao<
  K extends MinimalId,
  D extends ITokenTimetable<K>,
> extends IBaseDao<D> {}
