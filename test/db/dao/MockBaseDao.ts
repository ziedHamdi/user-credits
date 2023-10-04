import { IBaseDao } from "../../../src/db/dao";

export class MockBaseDao<D extends object, I extends IBaseDao<D>> implements IBaseDao<D> {
  protected readonly mockFunctions: I;

  // Declare the functions as public fields
  public count = jest.fn(async () => 0);
  public create = jest.fn(async () => this.sampleDTO);
  public deleteById = jest.fn(async () => false);
  public find = jest.fn(async () => []);
  public findById = jest.fn(async () => this.sampleDTO);
  public findOne = jest.fn(async () => this.sampleDTO);
  public updateById = jest.fn(async () => this.sampleDTO);

  constructor(
    private readonly sampleDTO: D,
    overrides: Partial<I> | null,
  ) {
    this.mockFunctions = {
      count: this.count,
      create: this.create,
      deleteById: this.deleteById,
      find: this.find,
      findById: this.findById,
      findOne: this.findOne,
      updateById: this.updateById,
      ...(overrides ? { ...overrides } : {}),
    } as I;
  }

  // Rest of the class methods

  // Reset the mock function for the specified method
  resetMockfn(name: keyof I): void {
    (this.mockFunctions[name] as jest.Mock).mockReset();
  }

  // Mock the resolved value for the specified method
  mockResolveFnValue(name: keyof I, value: unknown): void {
    (this.mockFunctions[name] as jest.Mock).mockResolvedValue(value);
  }
}
