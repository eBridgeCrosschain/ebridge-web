const TON_RPC_URL = `https://toncenter.com/api/v2/jsonRPC?api_key=${process.env.NEXT_PUBLIC_TON_API_KEY}`;
export const CHAIN_INFO = {
  chainId: 1100,
  exploreUrl: 'https://tonviewer.com/',
  rpcUrl: TON_RPC_URL,
  chainName: 'Ton',
  nativeCurrency: {
    name: 'TON Chain Native Token',
    symbol: 'TON',
    decimals: 18,
  },
  iconUrls: ['https://etherscan.io/token/images/bnb_28_2.png'],
  rpcUrls: [TON_RPC_URL],
  blockExplorerUrls: ['https://tonviewer.com/'],
};

export const BRIDGE_CONTRACT = 'EQBnIw0A17M18zeEHEekgpL32e6yu9cx57PnC990pByv2qJN';

// TON chain one token corresponds to one fund pool address
export const TOKEN_POOL_MAP = {
  USDT: 'EQBfBX543e7-MXC9iYoq1td_DsMufSqbfHN5L-biMTJqwf-e',
};
