import { Listener, Subjects, TicketUpdatedEvent } from '@pcg-tickets/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject = Subjects.TicketUpdated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const foundTicket = await Ticket.findByEvent(data);

    if (!foundTicket) {
      throw new Error('Ticket not found');
    }

    foundTicket.set({ title: data.title, price: data.price });

    await foundTicket.save();

    msg.ack();
  }
}
