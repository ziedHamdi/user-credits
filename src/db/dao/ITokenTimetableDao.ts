import { ITokenTimetable } from "../model/ITokenTimetable";
import {IBaseDAO} from "./IBaseDAO";

export interface ITokenTimetableDao<
  K extends object,
  D extends ITokenTimetable<K>,
> extends IBaseDAO<D> {}
