export const CHAIN_INFO = {
  chainId: 'AELF',
  exploreUrl: 'https://aelfscan.io/AELF/',
  rpcUrl: 'https://aelf-public-node.aelf.io',
  // rpcUrl: 'https://explorer.aelf.io/chain',
};

export const TOKEN_CONTRACT = 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE';
export const CROSS_CHAIN_CONTRACT = '2SQ9LeGZYSWmfJcYuQkDQxgd3HzwjamAaaL4Tge2eFSXw2cseq';
export const BRIDGE_CONTRACT = '2dKF3svqDXrYtA5mYwKfADiHajo37mLZHPHVVuGbEDoD9jSgE8';
export const TOKEN_POOL = '2TXvtjgTiMwjvEyWGEvfbeQ9P6zVK55pTPcmzvLFBDCMLNUYXV';

const EXPAND_CONTRACTS: any = {};
[TOKEN_CONTRACT].map((i) => {
  EXPAND_CONTRACTS[i] = i;
});

export const CONTRACTS = {
  ...EXPAND_CONTRACTS,
};
