export const CHAIN_INFO = {
  chainId: 'tDVV',
  exploreUrl: 'https://explorer-test-side02.aelf.io/',
  // rpcUrl: 'https://tdvv-public-node.aelf.io',
  rpcUrl: 'http://192.168.66.100:8000',
};

export const TOKEN_CONTRACT = '7RzVGiuVWkvL4VfVHdZfQF2Tri3sgLe9U991bohHFfSRZXuGX';
export const CROSS_CHAIN_CONTRACT = '2snHc8AMh9QMbCAa7XXmdZZVM5EBZUUPDdLjemwUJkBnL6k8z9';
export const BRIDGE_CONTRACT = 'bXRnskXaJUPcz4uVmX29Fht87tQbGst7uixFGC7SniwVm7Uf9';

const EXPAND_CONTRACTS: any = {};
[TOKEN_CONTRACT].map((i) => {
  EXPAND_CONTRACTS[i] = i;
});

export const CONTRACTS = {
  ...EXPAND_CONTRACTS,
};
