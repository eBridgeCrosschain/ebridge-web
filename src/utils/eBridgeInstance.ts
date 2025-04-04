export class EBridgeInstance {
  public unauthorized: boolean;
  public obtainingSignature: boolean;

  constructor() {
    this.unauthorized = false;
    this.obtainingSignature = false;
  }

  setUnauthorized(status: boolean) {
    this.unauthorized = status;
  }

  setObtainingSignature(status: boolean) {
    this.obtainingSignature = status;
  }
}

export const eBridgeInstance = new EBridgeInstance();
