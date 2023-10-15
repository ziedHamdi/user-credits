export interface IConfigReader {
  currency(): string;
  paymentApiVersion(): string;
  paymentPublicKey(): string;
  paymentSecretKey(): string;
}
