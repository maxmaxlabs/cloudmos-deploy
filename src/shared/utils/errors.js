export class BroadcastingError extends Error {
  constructor(message, txHash) {
    super(message);
    this.txHash = txHash;
  }
}
