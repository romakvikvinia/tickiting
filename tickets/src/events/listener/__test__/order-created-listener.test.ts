import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCreatedEvent, OrderStatus } from "@ge_tickets/common";
import { Ticket } from "../../../models/ticket.entity";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created.listener";

const setUp = async () => {
  // create instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);
  // Create and save ticket
  const ticket = Ticket.build({
    title: "Concert",
    price: 2.22,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  // create fake data event
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: ticket.userId,
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, ticket, data, msg };
};

it("sets the userId of the ticket ", async () => {
  const { listener, data, msg, ticket } = await setUp();
  // call onMessage function with data object + message object
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("calls the ack message", async () => {
  const { listener, data, msg, ticket } = await setUp();
  // call onMessage function with data object + message object
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, data, msg, ticket } = await setUp();
  // call onMessage function with data object + message object
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedDate = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(data.id).toEqual(ticketUpdatedDate.orderId);
});
