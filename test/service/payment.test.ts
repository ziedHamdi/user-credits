import { IPayment } from "../../src/service/IPayment";

export function testPayment<K extends object>(paymentService: IPayment<K>) {
  // describe("IPayment implementation should be able to create an order, execute it, get notified of updates and tell the user token credit status", () => {
  //   it("createOrder should return an IOrder object", () => {
  //     const offerId = "123";
  //     const userId = "456";
  //     const order = paymentService.createOrder(offerId, userId);
  //     expect(order).toBeDefined();
  //     expect(order.offerId).toBe(offerId);
  //     expect(order.userId).toBe(userId);
  //     expect(order.status).toBe("pending");
  //   });
  // });
}