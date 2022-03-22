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
it("returns users orders", async () => {
  // Create tree tickets
  const ticketOne = await createTicket();
  const ticketTwo = await createTicket();
  const ticketTree = await createTicket();

  const userOne = global.signIn();
  const userTow = global.signIn();
  // create one order as user#1
  await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({
      ticketId: ticketOne.id,
    })
    .expect(201);
  // create two order as user#2
  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTow)
    .send({
      ticketId: ticketTwo.id,
    })
    .expect(201);
  const { body: orderTwo } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTow)
    .send({
      ticketId: ticketTree.id,
    })
    .expect(201);
  // make request user #2

  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", userTow)
    .expect(200);

  //   console.log(response.body);

  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketTree.id);
});
