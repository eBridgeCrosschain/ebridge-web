import EventEmitter from 'events';

export const eventBus = new EventEmitter();

const EventList = [
  'Unauthorized',
  'AelfLoginSuccess',
  'AelfLogoutSuccess',
  'AelfAuthTokenSuccess',
  'GlobalLoading',
] as const;

// eslint-disable-next-line no-new-func
const eventsServer = new Function();

eventsServer.prototype.parseEvent = function (name: string, eventMap: string[]) {
  const obj: any = (this[name] = {});
  eventMap.forEach((item) => {
    const eventName = item.toLocaleUpperCase();
    obj[item] = {
      emit: this.emit.bind(this, eventName),
      addListener: this.addListener.bind(this, eventName),
      name: eventName,
    };
  });
};

eventsServer.prototype.emit = function (eventType: string, ...params: any[]) {
  eventBus.emit(eventType, ...params);
};
eventsServer.prototype.addListener = function (eventType: string, listener: (data: any) => void) {
  const cListener = eventBus.addListener(eventType, listener);
  return { ...cListener, remove: () => eventBus.removeListener(eventType, listener) };
};

eventsServer.prototype.parseEvent('base', EventList);

export type TEBridgeEventEmitter = {
  remove: () => void;
} & EventEmitter;

export type TEBridgeEventBusTypes = {
  [x in (typeof EventList)[number]]: {
    emit: (...params: any[]) => void;
    addListener: (listener: (data: any) => void) => TEBridgeEventEmitter;
    name: string;
  };
};

const eBridgeEventBus = { ...eventsServer.prototype.base };

export default eBridgeEventBus as unknown as TEBridgeEventBusTypes;
