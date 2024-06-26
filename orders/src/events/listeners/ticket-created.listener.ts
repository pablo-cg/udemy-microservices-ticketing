import { Listener, Subjects, TicketCreatedEvent } from '@pcg-tickets/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject = Subjects.TicketCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const ticket = Ticket.build({
      id: data.id,
      price: data.price,
      title: data.title,
    });

    await ticket.save();

    msg.ack();
  }
}
