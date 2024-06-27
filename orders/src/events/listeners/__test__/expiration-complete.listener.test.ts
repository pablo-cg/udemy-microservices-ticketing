import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { natsClientWrapper } from '../../../nats-client-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete.listener';
import { Order, OrderStatus } from '../../../models/order';
import { Message } from 'node-nats-streaming';
import { ExpirationCompleteEventData, Subjects } from '@pcg-tickets/common';

async function setup() {
  const listener = new ExpirationCompleteListener(natsClientWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date(),
    status: OrderStatus.CREATED,
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEventData = {
    orderId: order.id,
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, order, data, message };
}

it('updates the order status to cancelled', async () => {
  const { listener, order, data, message } = await setup();

  await listener.onMessage(data, message);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED);
});

it('emit an order:cancelled event', async () => {
  const { listener, order, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(natsClientWrapper.client.publish).toHaveBeenCalled();

  const eventSubject = (natsClientWrapper.client.publish as jest.Mock).mock
    .calls[0][0];
  const eventData = JSON.parse(
    (natsClientWrapper.client.publish as jest.Mock).mock.calls[0][1],
  );

  expect(eventSubject).toEqual(Subjects.OrderCancelled);
  expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});
