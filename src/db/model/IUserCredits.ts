export interface Subscription {
  expires: Date;
  offer: string;
  starts: Date;
  status: "pending" | "paid" | "refused";
}

export interface IUserCredits {
  subscriptions: Subscription[];
  tokens: number;
  userId: string;
}
