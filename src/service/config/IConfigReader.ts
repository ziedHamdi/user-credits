export interface IConfigReader {
  currency(): string;
  paymentApiVersion(): "2023-08-16";
  paymentPublicKey(): string;
  paymentSecretKey(): string;
}
