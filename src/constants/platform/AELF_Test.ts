export const CHAIN_INFO = {
  chainId: 'AELF',
  exploreUrl: 'https://testnet.aelfscan.io/AELF/',
  rpcUrl: 'https://aelf-test-node.aelf.io',
};

export const TOKEN_CONTRACT = 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE';
export const CROSS_CHAIN_CONTRACT = '2SQ9LeGZYSWmfJcYuQkDQxgd3HzwjamAaaL4Tge2eFSXw2cseq';
export const BRIDGE_CONTRACT = 'foDLAM2Up3xLjg43SvCy5Ed6zaY5CKG8uczj6yUVZUweqQUmz';

const EXPAND_CONTRACTS: any = {};
[TOKEN_CONTRACT].map((i) => {
  EXPAND_CONTRACTS[i] = i;
});

export const CONTRACTS = {
  ...EXPAND_CONTRACTS,
};
