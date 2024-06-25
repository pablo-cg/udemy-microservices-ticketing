import { OrderCreatedEvent, Publisher, Subjects } from '@pcg-tickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject = Subjects.OrderCreated;
}
