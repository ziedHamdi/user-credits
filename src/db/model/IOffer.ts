export interface IOffer {
  cycle: "once" | "weekly" | "monthly" | "yearly";
  kind: "subscription" | "tokens" | "expertise";
  name: string;
  parentOfferId: unknown;
  price: number;
  tokenCount: number;
}
