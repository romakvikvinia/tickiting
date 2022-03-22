import request from "supertest";
import { app } from "../../app";

it("can fetch tickets list", async () => {
  await request(app)
    .post("/api/tickets")
    .send({
      title: "New Ticket",
      price: 11.05,
    })
    .set("Cookie", global.signIn())
    .expect(201);

  await request(app)
    .post("/api/tickets")
    .send({
      title: "New Ticket2",
      price: 11.05,
    })
    .set("Cookie", global.signIn())
    .expect(201);

  const response = await request(app).get(`/api/tickets`).send().expect(200);

  expect(response.body.length).toEqual(2);
});
