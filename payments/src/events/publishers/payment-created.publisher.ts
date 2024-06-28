import { PaymentCreatedEvent, Publisher, Subjects } from '@pcg-tickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject = Subjects.PaymentCreated;
}
