import { Listener, OrderCancelledEvent, Subjects } from "@ge_tickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket.entity";
import { TicketUpdatedPublisher } from "../publishers/ticket-update.publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    // find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);
    // if no ticket throw error
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Mark the ticket as begin reserved by setting it's orderId property
    ticket.set({ orderId: undefined });

    // save the ticket
    await ticket.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });
    msg.ack();
  }
}
