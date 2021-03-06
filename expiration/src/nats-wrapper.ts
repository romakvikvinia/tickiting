import nats, { Stan } from "node-nats-streaming";

class NatsWrapper {
  private _client?: Stan;
  get client(): Stan {
    if (!this._client) {
      throw new Error("Can not access NATS before connecting");
    }
    return this._client;
  }
  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });
    return new Promise((resolve, reject) => {
      this.client.on("connect", () => {
        console.log("Connected to NATS");
        resolve("");
      });
      this.client.on("error", (error) => {
        reject(error);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
