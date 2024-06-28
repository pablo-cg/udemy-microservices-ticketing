import { OrderCancelledEventData, OrderStatus } from '@pcg-tickets/common';
import { natsClientWrapper } from '../../../nats-client-wrapper';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { OrderCancelledListener } from '../order-cancelled.listener';

async function setup() {
  const listener = new OrderCancelledListener(natsClientWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.CREATED,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
  });

  await order.save();

  const data: OrderCancelledEventData = {
    id: order.id,
    version: 1,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
    },
  };

  //@ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
}

it('updates the status of the order', async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  const updatedOrder = await Order.findById(data.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED);
});

it('acks the message', async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});
