import {
  Listener,
  NotFoundError,
  OrderCancelledEvent,
  OrderCancelledEventData,
  Subjects,
} from '@pcg-tickets/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from './queue-group-name';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated.publisher';
import { Ticket } from '../../models/ticket';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject = Subjects.OrderCancelled;
  queueGroupName = QUEUE_GROUP_NAME;

  private ticketUpdatedPublisher = new TicketUpdatedPublisher(this.client);

  async onMessage(data: OrderCancelledEventData, msg: Message) {
    const foundTicket = await Ticket.findById(data.ticket.id);

    if (!foundTicket) {
      throw new NotFoundError();
    }

    foundTicket.set({ orderId: undefined });

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
