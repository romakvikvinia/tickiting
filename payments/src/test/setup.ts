import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var signIn: (id?: string) => string[];
}

jest.mock("../nats-wrapper");
let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.JWT_KEY = "asdasd";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signIn = (id?: string) => {
  // build payload JWT {id,email}

  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  // create JWT

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build session object {"jwt":MY_JWT}

  const session = { jwt: token };

  // turn that session object to json
  const sessionJSON = JSON.stringify(session);
  // take json and mace base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  /// return cooke
  return [`session=${base64}`];
};
