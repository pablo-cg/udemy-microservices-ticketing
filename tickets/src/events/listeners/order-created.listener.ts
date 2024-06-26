import {
  Listener,
  NotFoundError,
  OrderCreatedEvent,
  OrderCreatedEventData,
  Subjects,
} from '@pcg-tickets/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated.publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  private ticketUpdatedPublisher = new TicketUpdatedPublisher(this.client);

  async onMessage(data: OrderCreatedEventData, msg: Message) {
    const foundTicket = await Ticket.findById(data.ticket.id);

    if (!foundTicket) {
      throw new NotFoundError();
    }

    foundTicket.set({ orderId: data.id });

    await foundTicket.save();

    await this.ticketUpdatedPublisher.publish({
      id: foundTicket.id,
      price: foundTicket.price,
      title: foundTicket.title,
      userId: foundTicket.userId,
      orderId: foundTicket.orderId,
      version: foundTicket.version,
    });

    msg.ack();
  }
}
