export const CHAIN_INFO = {
  chainId: 'AELF',
  exploreUrl: 'https://testnet.aelfscan.io/AELF/',
  rpcUrl: 'https://aelf-test-node.aelf.io',
};

export const TOKEN_CONTRACT = 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE';
export const CROSS_CHAIN_CONTRACT = '2SQ9LeGZYSWmfJcYuQkDQxgd3HzwjamAaaL4Tge2eFSXw2cseq';
export const BRIDGE_CONTRACT = '2rC1X1fudEkJ4Yungj5tYNJ93GmBxbSRiyJqfBkzcT6JshSqz9';
export const TOKEN_POOL = '2WhjZ9VedLuibSX9qT8BNZ89EW3pf4dtmREUFiBgdswF4XoqZN';

const EXPAND_CONTRACTS: any = {};
[TOKEN_CONTRACT].map((i) => {
  EXPAND_CONTRACTS[i] = i;
});

export const CONTRACTS = {
  ...EXPAND_CONTRACTS,
};
