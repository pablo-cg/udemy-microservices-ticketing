import { Publisher, Subjects, TicketCreatedEvent } from '@pcg-tickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject = Subjects.TicketCreated;
}
