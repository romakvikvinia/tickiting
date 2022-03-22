import { OrderCreatedEvent, Publisher, Subjects } from "@ge_tickets/common";

export class OrderCreatePublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
