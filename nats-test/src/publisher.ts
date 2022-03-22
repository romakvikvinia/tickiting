import nats from "node-nats-streaming";
import { TicketCreatePublisher } from "./evenets/ticket-create-publisher";
console.clear();
const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});
//@ts-ignore
stan.on("connect", async () => {
  console.log("publisher connected to NATS");
  const publisher = new TicketCreatePublisher(stan);

  try {
    await publisher.publish({
      id: "1",
      title: "new title",
      price: 20,
    });
  } catch (error) {
    console.error(error);
  }
});
