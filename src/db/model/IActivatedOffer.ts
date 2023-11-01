/**
 * Interface representing an activated offer.
 */
export interface IActivatedOffer {
  /**
   * The expiry date of the activated offer.
   */
  expires: Date;

  /**
   * The grouping of offers to which this offer belongs.
   */
  offerGroup: string[];

  /**
   * The start date of the activated offer.
   */
  starts: Date;

  /**
   * The number of tokens associated with the activated offer.
   */
  tokens: number;
}
