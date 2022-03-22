import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from "@ge_tickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/Order";
import { queueGroupName } from "./queue-group-name";

export class OrderCanceledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const order = await Order.findByEvent(data);

    if (!order) throw new Error("order nor found");

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
