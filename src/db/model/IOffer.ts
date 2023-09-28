export interface IOffer {
  cycle: "once" | "monthly" | "yearly";
  kind: "subscription" | "tokens" | "expertise";
  name: string;
  price: number;
  tokensCount: number;
}
