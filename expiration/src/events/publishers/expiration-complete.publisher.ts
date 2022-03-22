import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@ge_tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
