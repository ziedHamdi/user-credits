export interface ISubscription {
  expires: Date;
  offerId: unknown;
  starts: Date;
  status: "pending" | "paid" | "refused";
}

export interface IUserCredits {
  subscriptions: (unknown extends ISubscription ? unknown : never)[];
  tokens: number;
  userId: unknown;
}
