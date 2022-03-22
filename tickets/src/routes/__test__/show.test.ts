import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

it("returns 404 if thi ticket not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});
it("returns ticket if thi ticket  found", async () => {
  const ticket = {
    title: "New Ticket",
    price: 11.05,
  };
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signIn())
    .send(ticket)
    .expect(201);

  const { body } = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticket.price).toEqual(body.price);
  expect(ticket.title).toEqual(body.title);
});
