import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketUpdatedEvent } from "@ge_tickets/common";
import { Ticket } from "../../../models/ticket.entity";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated.listener";

const setUp = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);
  // create and save a ticket

  const ticket = await Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 2.22,
  });
  await ticket.save();
  // Create a fake data object
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    title: " new Concert",
    price: 3.33,
    version: ticket.version + 1,
    userId: "abcd",
  };
  // create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  // return all of this stuff
  return { listener, ticket, data, msg };
};

it("finds , updates, saves a ticket", async () => {
  const { listener, data, msg, ticket } = await setUp();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("excepts an error for versions", async () => {
  const { listener, data, msg, ticket } = await setUp();
  try {
    await listener.onMessage(
      {
        ...data,
        version: data.version + 10,
      },
      msg
    );
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled();
});

it("ack's the message", async () => {
  const { listener, data, msg } = await setUp();
  await listener.onMessage(data, msg);
  expect(msg.ack).toBeCalled();
});

// it("does not call ack if the event has future eversion", async () => {
//   const { listener, data, msg } = await setUp();
//   data.version = 10;
//   try {
//     await listener.onMessage(data, msg);
//   } catch (error) {}
//   expect(msg.ack).not.toHaveBeenCalled();
// });
