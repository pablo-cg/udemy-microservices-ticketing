import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';

it('fetches the order', async () => {
  const cookie = signin();

  // Create a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
  });

  await ticket.save();

  // order the ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  // fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch another users order', async () => {
  const cookie = signin();

  // Create a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
  });

  await ticket.save();

  // order the ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  // fetch the order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', signin())
    .expect(401);
});
