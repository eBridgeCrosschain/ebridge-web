export function basicActions<T extends string>(type: T, payload?: any) {
  return {
    type,
    payload,
  };
}

export type BasicActions<T = string> = {
  dispatch: (actions: { type: T; payload: any }) => void;
};

const formatPubKey = (publicKey: any) => {
  const toStr = (x: string, y: string) => '04' + x?.padStart(64, '0') + y?.padStart(64, '0');

  if (typeof publicKey === 'object') {
    const { x, y } = publicKey ?? {};
    return toStr(x, y);
  } else {
    try {
      const { x, y } = JSON.parse(publicKey) ?? {};
      return toStr(x, y);
    } catch (e) {
      return publicKey;
    }
  }
};

export const formatLoginInfo = (loginInfo: any) => {
  const detail = JSON.parse(loginInfo);
  const { publicKey } = detail;
  const pubKey = formatPubKey(publicKey);
  return { ...detail, pubKey };
};
