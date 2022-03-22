import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket.entity";

const createTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: " New Ticket",
    price: 23.45,
  });
  await ticket.save();
  return ticket;
};
it("returns an order", async () => {
  const ticketOne = await createTicket();
  const userOne = global.signIn();

  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({
      ticketId: ticketOne.id,
    })
    .expect(201);

  const response = await request(app)
    .get(`/api/orders/${orderOne.id}`)
    .set("Cookie", userOne)
    .expect(200);

  expect(response.body.id).toEqual(orderOne.id);
});

it("returns an error if one user fetch an others", async () => {
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
    .get(`/api/orders/${orderOne.id}`)
    .set("Cookie", global.signIn())
    .expect(404);
});
