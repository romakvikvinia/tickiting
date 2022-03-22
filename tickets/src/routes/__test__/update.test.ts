import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket.entity";

it("returns 404 if provided id dose not exists", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signIn())
    .send({
      title: "new title",
      price: 20.2,
    })

    .expect(404);
});
it("returns a 401 if user not signed in", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "new title",
      price: 20.2,
    })
    .expect(401);
});
it("returns a 401 if user does not owns a ticket", async () => {
  const createdTicket = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", global.signIn())
    .send({
      title: "new title",
      price: 20.2,
    })

    .expect(201);

  await request(app)
    .put(`/api/tickets/${createdTicket.body.id}`)
    .set("Cookie", global.signIn())
    .send({
      title: "new title",
      price: 20.2,
    })
    .expect(401);
});
it("returns a 400 if user provided invalid title or price", async () => {
  const cookie = global.signIn();
  const createdTicket = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 20.2,
    })

    .expect(201);

  await request(app)
    .put(`/api/tickets/${createdTicket.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 20.2,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${createdTicket.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "asdasdasdasd",
      price: -20.2,
    })
    .expect(400);
});
it("updates the ticket if provided valid puts ", async () => {
  const cookie = global.signIn();
  const createdTicket = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 20.2,
    })

    .expect(201);

  await request(app)
    .put(`/api/tickets/${createdTicket.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "asdasdasd",
      price: 20.2,
    })
    .expect(200);

  const { body } = await request(app)
    .get(`/api/tickets/${createdTicket.body.id}`)
    .send()
    .expect(200);

  expect(body.title).toEqual("asdasdasd");
  expect(body.price).toEqual(20.2);
});

it("publishes an event update ticket", async () => {
  const cookie = global.signIn();
  const createdTicket = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 20.2,
    })

    .expect(201);

  await request(app)
    .put(`/api/tickets/${createdTicket.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "asdasdasd",
      price: 20.2,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if the ticket is reserved", async () => {
  const cookie = global.signIn();
  const createdTicket = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 20.2,
    })

    .expect(201);
  const ticket = await Ticket.findById(createdTicket.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();
  await request(app)
    .put(`/api/tickets/${createdTicket.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "asdasdasd",
      price: 20.2,
    })
    .expect(400);
});
