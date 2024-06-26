import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { natsClientWrapper } from '../../../nats-client-wrapper';
import { TicketUpdatedListener } from '../ticket-updated.listener';
import { TicketUpdatedEvent } from '@pcg-tickets/common';
import { Ticket } from '../../../models/ticket';

async function setup() {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsClientWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });

  await ticket.save();

  // create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message, ticket };
}

it('finds and updates a ticket', async () => {
  const { listener, data, message, ticket } = await setup();

  // call onmessage with data and message
  await listener.onMessage(data, message);

  // write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.version).toEqual(data.version);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { listener, data, message } = await setup();

  // call onmessage with data and message
  await listener.onMessage(data, message);

  // write assertions to make sure ack function is called
  expect(message.ack).toHaveBeenCalled();
});

it('doesnt call ack if the event has a skipped version', async () => {
  const { listener, data, message } = await setup();

  data.version = 10;

  // call onmessage with data and message
  try {
    await listener.onMessage(data, message);
  } catch (error) {}

  // write assertions to make sure ack function is called
  expect(message.ack).not.toHaveBeenCalled();
});
