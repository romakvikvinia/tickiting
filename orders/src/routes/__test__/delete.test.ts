import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order.entity";
import { Ticket } from "../../models/ticket.entity";
import { natsWrapper } from "../../nats-wrapper";

const createTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: " New Ticket",
    price: 23.45,
  });
  await ticket.save();
  return ticket;
};
it("returns an order with status cancelled ", async () => {
  const ticketOne = await createTicket();
  const userOne = global.signIn();

  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({
      ticketId: ticketOne.id,
    })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${orderOne.id}`)
    .set("Cookie", userOne)
    .expect(204);

  const fetchOrder = await Order.findById(orderOne.id);

  expect(fetchOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("publish an event delete", async () => {
  const ticketOne = await createTicket();
  const userOne = global.signIn();

  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({
      ticketId: ticketOne.id,
    })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${orderOne.id}`)
    .set("Cookie", userOne)
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
