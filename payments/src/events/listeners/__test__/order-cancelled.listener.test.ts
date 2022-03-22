import { OrderCancelledEvent, OrderStatus } from "@ge_tickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/Order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCanceledListener } from "../order-cancelled.listener";

const setUp = async () => {
  // listener
  const listener = new OrderCanceledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
  });

  await order.save();

  // data
  const data: OrderCancelledEvent["data"] = {
    orderId: order.id,
    version: order.version + 1,
    ticket: {
      id: "dsds",
    },
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, data, msg };
};

it("updates the status of the order", async () => {
  const { listener, data, msg } = await setUp();
  await listener.onMessage(data, msg);

  const order = await Order.findById(data.orderId);

  expect(order!.status).toEqual(OrderStatus.Cancelled);
});
it("ack the message", async () => {
  const { listener, data, msg } = await setUp();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
