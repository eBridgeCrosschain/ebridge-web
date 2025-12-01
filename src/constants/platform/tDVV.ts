export const CHAIN_INFO = {
  chainId: 'tDVV',
  exploreUrl: 'https://aelfscan.io/tDVV/',
  rpcUrl: 'https://tdvv-public-node.aelf.io',
  // rpcUrl: 'https://tdvv-explorer.aelf.io/chain',
};

export const TOKEN_CONTRACT = '7RzVGiuVWkvL4VfVHdZfQF2Tri3sgLe9U991bohHFfSRZXuGX';
export const CROSS_CHAIN_CONTRACT = '2snHc8AMh9QMbCAa7XXmdZZVM5EBZUUPDdLjemwUJkBnL6k8z9';
export const BRIDGE_CONTRACT = 'GZs6wyPDfz3vdEmgVd3FyrQfaWSXo9uRvc7Fbp5KSLKwMAANd';
export const TOKEN_POOL = 'ttm4YsRRTV2zWx7hDpBV5gfLfWhqtde8N4XYQtZyoTyKi3tq9';

const EXPAND_CONTRACTS: any = {};
[TOKEN_CONTRACT].map((i) => {
  EXPAND_CONTRACTS[i] = i;
});

export const CONTRACTS = {
  ...EXPAND_CONTRACTS,
};
