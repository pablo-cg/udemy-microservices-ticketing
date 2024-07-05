import mongoose from 'mongoose';
import { app } from './app';
import { natsClientWrapper } from './nats-client-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created.listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled.listener';

async function start() {
  console.log('Starting up...');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  try {
    await natsClientWrapper.connect({
      clusterId: process.env.NATS_CLUSTER_ID,
      clientId: process.env.NATS_CLIENT_ID,
      url: process.env.NATS_URL,
    });

    natsClientWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });

    process.on('SIGINT', () => natsClientWrapper.client.close());
    process.on('SIGTERM', () => natsClientWrapper.client.close());

    new OrderCreatedListener(natsClientWrapper.client).listen();
    new OrderCancelledListener(natsClientWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log('🚀 ~ start ~ connected to mongodb');
  } catch (error) {
    console.error('🚀 ~ start ~ error:', error);
  }

  app.listen(3000, () => {
    console.log('🚀 ~ Tickets Listening on port: 3000');
  });
}

start();
