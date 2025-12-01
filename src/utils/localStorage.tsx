export const clearWCStorageByDisconnect = () => {
  const localStorage = window.localStorage;
  Object.keys(localStorage).map((item: string) => {
    if (/^wc/.test(item)) {
      localStorage.removeItem(item);
    }
  });
};
