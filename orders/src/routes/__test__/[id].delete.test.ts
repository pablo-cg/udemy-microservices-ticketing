import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsClientWrapper } from '../../nats-client-wrapper';

it('mark an order as cancelled', async () => {
  const cookie = signin();
  // create ticket
  const ticker = Ticket.build({
    title: 'concert',
    price: 20,
  });

  await ticker.save();
  // order ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({
      ticketId: ticker.id,
    });

  // cancel order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);

  const cancelledOrder = await Order.findById(order.id);

  expect(cancelledOrder!.status).toEqual(OrderStatus.CANCELLED);
});

it('emits an order cancelled event', async () => {
  const cookie = signin();
  // create ticket
  const ticker = Ticket.build({
    title: 'concert',
    price: 20,
  });

  await ticker.save();
  // order ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({
      ticketId: ticker.id,
    });

  // cancel order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);

  expect(natsClientWrapper.client.publish).toHaveBeenCalled();
});
