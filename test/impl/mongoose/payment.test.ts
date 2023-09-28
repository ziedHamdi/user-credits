import { Types } from "mongoose";

import { Payment } from "../../../src/impl/mongoose/service/Payment";

// Mocking implementation of the IPayment interface
const paymentService: Payment = new Payment(
  "mongodb+srv://vercel-admin-user:1fl97v6wmzZwFOZ3@cluster0.4rjswei.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  "cvlinkin",
);

beforeAll(async () => {
  await paymentService.init();
});

//NOTE ideally this code should go to the base tests: https://stackoverflow.com/questions/77192614/how-how-to-define-a-generic-test-with-interfaces-in-jest-then-run-it-for-each-im
describe("IPayment implementation should be able to create an order, execute it, get notified of updates and tell the user token credit status", () => {
  it("createOrder should return an IOrder object", async () => {
    const offerId = new Types.ObjectId();
    const userId = new Types.ObjectId();
    const order = await paymentService.createOrder(offerId, userId);
    expect(order).toBeDefined();
    expect(order.offerId).toBe(offerId);
    expect(order.userId).toBe(userId);
    expect(order.status).toBe("pending");
  });
});
