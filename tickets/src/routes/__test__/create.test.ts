import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket.entity";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handling to /api/tickets for post request ", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toEqual(404);
});
it("can be only accessed if user signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).toEqual(401);
});
it("returns a status code other than 401 if user signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .send({})
    .set("Cookie", global.signIn());

  expect(response.status).not.toEqual(401);
});
it("returns an error if an invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .send({ title: "", price: 10 })
    .set("Cookie", global.signIn())
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .send({ price: 10 })
    .set("Cookie", global.signIn())
    .expect(400);
});
it("returns an error if an invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .send({ title: "asdasdasdas", price: -10 })
    .set("Cookie", global.signIn())
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .send({ title: "asdasdas" })
    .set("Cookie", global.signIn())
    .expect(400);
});
it("creates a ticket with valid inputs", async () => {
  // add check to make sure a ticket was saved
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const ticket = {
    title: "New Ticket",
    price: 11.05,
  };

  await request(app)
    .post("/api/tickets")
    .send(ticket)
    .set("Cookie", global.signIn())
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
});

it("publishes an event", async () => {
  const ticket = {
    title: "New Ticket",
    price: 11.05,
  };

  await request(app)
    .post("/api/tickets")
    .send(ticket)
    .set("Cookie", global.signIn())
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
