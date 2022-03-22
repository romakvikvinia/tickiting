import request from "supertest";
import { app } from "../../app";

it("response with details about current user", async () => {
  const cookie = await global.signIn();
  const response = await request(app)
    .get("/api/users/current")
    .set("Cookie", cookie)
    .expect(200);
  expect(response.body.user.email).toEqual("test@tets.com");
  //   console.log(response.body);
});

it("fails unauthorized 401", async () => {
  await request(app).get("/api/users/current").expect(401);
});
