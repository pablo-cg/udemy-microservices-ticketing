import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@pcg-tickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject = Subjects.ExpirationComplete;
}
