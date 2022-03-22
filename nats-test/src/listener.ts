import nats from "node-nats-streaming";
//@ts-ignore
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./evenets/ticket-create-listener";

console.clear();
const stan = nats.connect("ticketing", randomBytes(3).toString("hex"), {
  url: "http://localhost:4222",
});
//@ts-ignore
stan.on("connect", function () {
  console.log("NATS Listening connected");
  //@ts-ignore
  stan.on("close", () => {
    console.log("NATS connection closed");
    //@ts-ignore
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

//@ts-ignore
process.on("SIGINT", () => stan.close());
//@ts-ignore
process.on("SIGTERM", () => stan.close());
