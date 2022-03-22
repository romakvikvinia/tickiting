import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { ExpirationCompleteListener } from "../expiration-complete.listenere";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket.entity";
import { Order, OrderStatus } from "../../../models/order.entity";
import { ExpirationCompleteEvent } from "@ge_tickets/common";

const setUp = async () => {
  // listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  //
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 2.22,
  });

  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: "asdas",
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  // fake data
  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, ticket, data, msg };
};

it("updates order status to cancelled", async () => {
  const { listener, data, msg } = await setUp();
  await listener.onMessage(data, msg);

  const updateOrder = await Order.findById(data.orderId);

  expect(updateOrder!.status).toEqual(OrderStatus.Cancelled);
});
it("emit an order cancelled event", async () => {
  const { listener, data, msg } = await setUp();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.orderId).toEqual(data.orderId);
});
it("ack the message", async () => {
  const { listener, data, msg } = await setUp();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
