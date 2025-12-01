export const CHAIN_INFO = {
  chainId: 'tDVW',
  exploreUrl: 'https://testnet.aelfscan.io/tDVW/',
  rpcUrl: 'https://tdvw-test-node.aelf.io',
};

export const TOKEN_CONTRACT = 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx';
export const CROSS_CHAIN_CONTRACT = '2PC7Jhb5V6iZXxz8uQUWvWubYkAoCVhtRGSL7VhTWX85R8DBuN';
export const BRIDGE_CONTRACT = '293dHYMKjfEuTEkveb5h775avTyW69jBgHMYiWQqtdSdTfsfEP';

export const TOKEN_POOL = '2DCTaXxFH63uG9tdXPGgGst7LK18y5zjBVfxamz1MQSi5hiuPM';

const EXPAND_CONTRACTS: any = {};
[TOKEN_CONTRACT].map((i) => {
  EXPAND_CONTRACTS[i] = i;
});

export const CONTRACTS = {
  ...EXPAND_CONTRACTS,
};
