import nats, { type Stan } from 'node-nats-streaming';

interface ConnectOptions {
  clusterId: string;
  clientId: string;
  url: string;
}

class NatsClientWrapper {
  private _client?: Stan;

  connect({ clientId, clusterId, url }: ConnectOptions) {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise<void>((resolve, reject) => {
      this.client.on('connect', () => {
        console.log(`Connected to NATS ${clusterId}/${clientId}`);

        return resolve();
      });

      this.client.on('error', (error) => {
        console.error(error);

        return reject(error);
      });
    });
  }

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }

    return this._client;
  }
}

export const natsClientWrapper = new NatsClientWrapper();
