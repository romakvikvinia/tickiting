import request from "supertest";
import { app } from "../../app";

it("returns 201 on successful signup", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@tets.com",
      password: "password",
    })
    .expect(201);
});

it("returns 400 with invalid email", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "testtets.com",
      password: "password",
    })
    .expect(400);
});

it("returns 400 with invalid password ", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@tets.com",
      password: "p",
    })
    .expect(400);
});

it("returns 400 with invalid empty body ", async () => {
  await request(app).post("/api/users/signup").send({}).expect(400);
});

it("returns cookie after successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test1@tets.com",
      password: "password",
    })
    .expect(201);
  expect(response.get("Set-Cookie")).toBeDefined();
});

it("disallows duplicate email address", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(400);
});
