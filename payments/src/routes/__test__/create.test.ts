import { OrderStatus } from "@ge_tickets/common";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/Order";
import { Payment } from "../../models/Pyament";
import { stripe } from "../../stripe";

jest.mock("../../stripe");

it("returns 404 for order that does not exists", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signIn())
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
      token: "123",
    })
    .expect(404);
});

it("returns 401 when purchasing an order that dose not belong to user", async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  await Order.build({
    id: orderId,
    status: OrderStatus.Created,
    userId: "12312",
    price: 20.2,
    version: 0,
  }).save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signIn())
    .send({
      orderId,
      token: "123",
    })
    .expect(401);
});
it("returns 400 when purchasing an cancelled order", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const orderId = new mongoose.Types.ObjectId().toHexString();

  await Order.build({
    id: orderId,
    status: OrderStatus.Cancelled,
    userId: userId,
    price: 20.2,
    version: 0,
  }).save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signIn(userId))
    .send({
      orderId,
      token: "123",
    })
    .expect(400);
});

it("returns 204 with valid inputs", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const orderId = new mongoose.Types.ObjectId().toHexString();

  await Order.build({
    id: orderId,
    status: OrderStatus.Created,
    userId: userId,
    price: 20,
    version: 0,
  }).save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signIn(userId))
    .send({
      orderId,
      token: "tok_visa",
    })
    .expect(201);

  const chargedOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

  expect(chargedOptions.source).toEqual("tok_visa");
  expect(chargedOptions.amount).toEqual(20 * 1000);
  expect(chargedOptions.currency).toEqual("usd");

  const payment = await Payment.findOne({ orderId });

  expect(payment).not.toBeNull();
});
