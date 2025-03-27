import { LocalStorageKey } from 'constants/storages';

export enum AuthTokenSource {
  Portkey = 'portkey',
  NightElf = 'nightElf',
  EVM = 'EVM',
}

export type QueryAuthApiExtraRequest = {
  pubkey: string;
  signature: string;
  plain_text: string;
  source: AuthTokenSource;
  managerAddress: string;
  ca_hash?: string; // for Portkey
  chain_id?: string; // for Portkey
  recaptchaToken?: string; // for NightElf
};

export type JWTData = {
  access_token: string;
  expires_in: number;
  token_type: string;
};
const Day = 1 * 24 * 60 * 60 * 1000;
export type LocalJWTData = {
  expiresTime?: number;
} & JWTData;
export const getLocalJWT = (key: string) => {
  try {
    const localData = localStorage.getItem(LocalStorageKey.ACCESS_TOKEN);
    if (!localData) return;
    const data = JSON.parse(localData) as { [key: string]: LocalJWTData };
    const cData = data[key];
    if (!cData || !cData?.expiresTime) return;
    if (Date.now() + 0.5 * Day > cData?.expiresTime) return;
    return cData;
  } catch (error) {
    return;
  }
};

export const resetLocalJWT = () => {
  return localStorage.removeItem(LocalStorageKey.ACCESS_TOKEN);
};

export const removeOneLocalJWT = (key: string) => {
  const localData = localStorage.getItem(LocalStorageKey.ACCESS_TOKEN);
  if (!localData) return;
  const data = JSON.parse(localData) as { [key: string]: LocalJWTData };
  delete data[key];

  localStorage.setItem(LocalStorageKey.ACCESS_TOKEN, JSON.stringify(data));
};

export const setLocalJWT = (key: string, data: LocalJWTData) => {
  const localData: LocalJWTData = {
    ...data,
    expiresTime: Date.now() + (data.expires_in - 10) * 1000,
  };
  const _oldLocalData = localStorage.getItem(LocalStorageKey.ACCESS_TOKEN);
  if (!_oldLocalData) {
    return localStorage.setItem(LocalStorageKey.ACCESS_TOKEN, JSON.stringify({ [key]: localData }));
  }

  const _localDataParse = JSON.parse(_oldLocalData) as { [key: string]: LocalJWTData };

  _localDataParse[key] = localData;

  return localStorage.setItem(LocalStorageKey.ACCESS_TOKEN, JSON.stringify(_localDataParse));
};

export function getAuthPlainText() {
  const plainText = `Welcome to eBridge!
  
Click to sign in and accept the eBridge Terms of Service (https://ebridge-exchange.gitbook.io/docs/more-information/terms-of-service) and Privacy Policy (https://ebridge-exchange.gitbook.io/docs/more-information/privacy-policy).
  
This request will not trigger a blockchain transaction or cost any gas fees.
  
Nonce:
${Date.now()}`;

  return {
    plainTextOrigin: plainText,
    plainTextHex: Buffer.from(plainText).toString('hex').replace('0x', ''),
  };
}
