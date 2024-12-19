export const CHAIN_INFO = {
  chainId: 'tDVW',
  exploreUrl: 'https://testnet.aelfscan.io/tDVW/',
  rpcUrl: 'https://tdvw-test-node.aelf.io',
};

export const TOKEN_CONTRACT = 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx';
export const CROSS_CHAIN_CONTRACT = '2PC7Jhb5V6iZXxz8uQUWvWubYkAoCVhtRGSL7VhTWX85R8DBuN';
export const BRIDGE_CONTRACT = 'JKjoabe2wyrdP1P8TvNyD4GZP6z1PuMvU2y5yJ4JTeBjTMAoX';

export const TOKEN_POOL = '2M8zJ8oY6s3KUbm5iwiVnbq8cid88yii4he9Xhf42QDEuMSUKk';

const EXPAND_CONTRACTS: any = {};
[TOKEN_CONTRACT].map((i) => {
  EXPAND_CONTRACTS[i] = i;
});

export const CONTRACTS = {
  ...EXPAND_CONTRACTS,
};
