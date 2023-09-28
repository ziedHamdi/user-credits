import { IOrder } from "../../../src/db/model/IOrder";
import { IUserCredits } from "../../../src/db/model/IUserCredits";
import { IPayment } from "../../../src/service/IPayment";

// Mocking implementation of the IPayment interface
const paymentService: IPayment = {
  createOrder: (offerId, userId) => {
    // Replace this with your mock IOrder object
    return {
      // history: [],
      offerId,
      status: "pending",
      tokenCount: 100,
      userId,
    } as IOrder;
  },
  execute: (order) => {
    // Replace this with your mock IUserCredits object
    return { tokens: 100, userId: order.userId } as IUserCredits;
  },
  orderStatusChanged: (orderId, status) => {
    // Replace this with your mock IOrder object
    return {
      offerId: "123",
      orderId,
      status,
      tokenCount: 100,
      userId: "456",
    } as IOrder;
  },
  remainingTokens: (userId) => {
    // Replace this with your mock IUserCredits object
    return { tokens: 200, userId } as IUserCredits;
  },
};

// describe("IPayment implementation should be able to create an order, execute it, get notified of updates and tell the user token credit status", () => {
//   it("runs mongoose tests", () => {
//     testPayment(paymentService);
//   });
// });
//FIXME should go to the base tests: https://stackoverflow.com/questions/77192614/how-how-to-define-a-generic-test-with-interfaces-in-jest-then-run-it-for-each-im
describe("IPayment implementation should be able to create an order, execute it, get notified of updates and tell the user token credit status", () => {
  it("createOrder should return an IOrder object", () => {
    const offerId = "123";
    const userId = "456";
    const order = paymentService.createOrder(offerId, userId);
    expect(order).toBeDefined();
    expect(order.offerId).toBe(offerId);
    expect(order.userId).toBe(userId);
    expect(order.status).toBe("pending");
  });
});
