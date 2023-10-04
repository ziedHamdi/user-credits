import { IBaseDAO } from "../../../src/db/dao/IBaseDAO";

export class MockBaseDao<D extends object, I extends IBaseDAO<D>>
  implements IBaseDAO<D>
{
  protected readonly mockFunctions: I;

  constructor(
    private readonly sampleDTO: D,
    overrides: Partial<I> | null,
  ) {
    this.mockFunctions = {
      count: jest.fn(async () => 0),
      create: jest.fn(async () => this.sampleDTO),
      deleteById: jest.fn(async () => false),
      find: jest.fn(async () => []),
      findById: jest.fn(async () => this.sampleDTO),
      findOne: jest.fn(async () => this.sampleDTO),
      updateById: jest.fn(async () => this.sampleDTO),
      ...(overrides ? { ...overrides } : {}),
    } as I;
  }

  async count(query: object): Promise<number> {
    return this.mockFunctions.count(query);
  }

  async create(data: Partial<D>): Promise<D> {
    return this.mockFunctions.create(data);
  }

  async deleteById(userId: string): Promise<boolean> {
    return this.mockFunctions.deleteById(userId);
  }

  async find(query: object): Promise<D[]> {
    return this.mockFunctions.find(query);
  }

  async findOne(query: object): Promise<D> {
    return this.mockFunctions.findOne(query);
  }

  async findById(userId: object): Promise<D | null> {
    return this.mockFunctions.findById(userId);
  }

  async updateById(userId: string, update: Partial<D>): Promise<D | null> {
    return this.mockFunctions.updateById(userId, update);
  }

  resetMockfn(name: keyof I): void {
    (this.mockFunctions[name] as jest.Mock).mockReset();
  }

  mockResolveFnValue(name: keyof I, value: unknown): void {
    (this.mockFunctions[name] as jest.Mock).mockResolvedValue(value);
  }
}
