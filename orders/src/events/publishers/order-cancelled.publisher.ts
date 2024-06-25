import { OrderCancelledEvent, Publisher, Subjects } from '@pcg-tickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject = Subjects.OrderCancelled;
}
