import eBridgeEventBus from 'utils/eBridgeEventBus';

export const emitLoading = (isLoading: boolean) => eBridgeEventBus.GlobalLoading.emit(isLoading);
