import { OrderCreatedEvent, OrderStatus, Subjects } from '@pcg-tickets/common';
import { natsClientWrapper } from '../../../nats-client-wrapper';
import { OrderCreatedListener } from '../order-created.listener';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { Message } from 'node-nats-streaming';

async function setup() {
  const listener = new OrderCreatedListener(natsClientWrapper.client);

  const ticket = Ticket.build({
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.CREATED,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, message };
}

it('sets the user id on the ticket', async () => {
  const { listener, ticket, data, message } = await setup();

  await listener.onMessage(data, message);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});

it('publishes a ticket:updated event', async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  const ticketUpdatedSubject = (natsClientWrapper.client.publish as jest.Mock)
    .mock.calls[0][0];
  const ticketUpdatedData = JSON.parse(
    (natsClientWrapper.client.publish as jest.Mock).mock.calls[0][1],
  );

  expect(natsClientWrapper.client.publish).toHaveBeenCalled();
  expect(ticketUpdatedSubject).toEqual(Subjects.TicketUpdated);
  expect(ticketUpdatedData.orderId).toEqual(data.id);
});
