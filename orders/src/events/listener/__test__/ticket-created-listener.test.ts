import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketUpdatedEvent } from "@ge_tickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created.listener";
import { Ticket } from "../../../models/ticket.entity";

const setUp = async () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  // create fake date of event
  const data: TicketUpdatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: "New ticket",
    price: 20.22,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // create fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return {
    listener,
    data,
    msg,
  };
};

it("creates and saves a ticket", async () => {
  const { listener, data, msg } = await setUp();
  // call onMessage function with data object + message object
  await listener.onMessage(data, msg);
  // write assertion to make sure a ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});
it("ack s the message", async () => {
  const { listener, data, msg } = await setUp();
  // call onMessage function with data object + message object
  await listener.onMessage(data, msg);
  // write assertion make sure call ack function
  expect(msg.ack).toBeCalled();
});
