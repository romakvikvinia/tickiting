import {
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from "@ge_tickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order.entity";
import { queueGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);
    if (!order) throw new Error("Order nor found");
    order.set({ status: OrderStatus.Complete });
    await order.save();

    msg.ack();
  }
}
