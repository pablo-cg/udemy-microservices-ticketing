import { OrderCreatedEventData, OrderStatus } from '@pcg-tickets/common';
import { natsClientWrapper } from '../../../nats-client-wrapper';
import { OrderCreatedListener } from '../order-created.listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';

async function setup() {
  const listener = new OrderCreatedListener(natsClientWrapper.client);

  const data: OrderCreatedEventData = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.CREATED,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 10,
    },
  };

  //@ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
}

it('it replicates the order info', async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  const order = await Order.findById(data.id);

  expect(order!.id).toEqual(data.id);
  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});
