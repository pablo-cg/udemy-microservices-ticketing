import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { OrderStatus } from '@pcg-tickets/common';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

jest.mock('../../stripe');

it('returns a 404 if the order does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({
      token: 'tok_visa',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns a 401 when the order does not belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 10,
    status: OrderStatus.CREATED,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 10,
    status: OrderStatus.CANCELLED,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(order.userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(400);
});

// it('returns a 201 with valid inputs', async () => {
//   const order = Order.build({
//     id: new mongoose.Types.ObjectId().toHexString(),
//     userId: new mongoose.Types.ObjectId().toHexString(),
//     version: 0,
//     price: 10,
//     status: OrderStatus.CREATED,
//   });
//   await order.save();

//   await request(app)
//     .post('/api/payments')
//     .set('Cookie', signin(order.userId))
//     .send({
//       token: 'tok_visa',
//       orderId: order.id,
//     })
//     .expect(201);

//   const chargesOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

//   expect(stripe.charges.create).toHaveBeenCalled();
//   expect(chargesOptions.source).toEqual('tok_visa');
//   expect(chargesOptions.amount).toEqual(order.price * 100);
//   expect(chargesOptions.currency).toEqual('usd');
// });
