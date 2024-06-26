import { natsClientWrapper } from './nats-client-wrapper';

async function start() {
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

    console.log("🚀 ~ start ~ Expiration service")
  } catch (error) {
    console.error('🚀 ~ start ~ error:', error);
  }
}

start();
