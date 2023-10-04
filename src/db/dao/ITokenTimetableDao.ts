import { ITokenTimetable } from "../model/ITokenTimetable";
import {IBaseDao} from "./IBaseDao";

export interface ITokenTimetableDao<
  K extends object,
  D extends ITokenTimetable<K>,
> extends IBaseDao<D> {}
