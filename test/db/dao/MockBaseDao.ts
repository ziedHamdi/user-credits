import { IBaseDao } from "../../../src/db/dao";

export class MockBaseDao<D extends object, I extends IBaseDao<D>>
  implements IBaseDao<D>
{
  // Declare the functions as public fields with jest.fn()
  public count = jest.fn(async () => 0);
  public create = jest.fn(async () => this.sampleDTO);
  public deleteById = jest.fn(async () => false);
  public find = jest.fn(async () => []);
  public findById = jest.fn(async () => this.sampleDTO);
  public findOne = jest.fn(async () => this.sampleDTO);
  public updateById = jest.fn(async () => this.sampleDTO);

  constructor(protected readonly sampleDTO: D) {}
}
