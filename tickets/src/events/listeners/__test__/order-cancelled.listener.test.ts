import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { natsClientWrapper } from '../../../nats-client-wrapper';
import { OrderCancelledListener } from '../order-cancelled.listener';
import { OrderCancelledEventData } from '@pcg-tickets/common';
import { Message } from 'node-nats-streaming';

async function setup() {
  const listener = new OrderCancelledListener(natsClientWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });

  ticket.set({ orderId });

  await ticket.save();

  const data: OrderCancelledEventData = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, orderId, data, message };
}

it('updates the tickets, publish the event and ack the message', async () => {
  const { listener, ticket, orderId, data, message } = await setup();

  await listener.onMessage(data, message);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(message.ack).toHaveBeenCalled();
  expect(natsClientWrapper.client.publish).toHaveBeenCalled();
});
