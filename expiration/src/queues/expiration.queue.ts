import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete.publisher';
import { natsClientWrapper } from '../nats-client-wrapper';

interface Payload {
  orderId: string;
}

export const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  await new ExpirationCompletePublisher(natsClientWrapper.client).publish({
    orderId: job.data.orderId,
  });
});
