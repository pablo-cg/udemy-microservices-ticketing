import { Publisher, Subjects, TicketUpdatedEvent } from '@pcg-tickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject = Subjects.TicketUpdated;
}
