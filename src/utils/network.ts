import { Connector } from 'wagmi';
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from 'constants/chain';
import storages from 'constants/storages';
import { eventBus } from 'utils/eBridgeEventBus';
import { isELFChain } from './aelfUtils';
import { COINBASE_WALLET_ID, METAMASK_WALLET_ID, NetworkType, WALLET_CONNECT_ID } from 'types';
import { ChainId } from 'types';
import { NetworkList } from 'constants/index';

type Info = {
  chainId: number | string;
  rpcUrls?: string[];
  chainName?: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls?: string[];
  iconUrls?: string[];
};
/**
 * Prompt the user to add RPC as a network on Metamask, or switch to RPC if the wallet is on a different network
 * @returns {boolean} true if the setup succeeded, false otherwise
 */
export const switchNetwork = async (info: Info): Promise<boolean> => {
  let provider = window.ethereum;
  console.log('====== ====== switchNetwork provider', provider);
  try {
    if (provider?.providerMap) {
      for (const [key, value] of provider.providerMap) {
        if (key === 'MetaMask' && value?.isMetaMask) provider = value;
      }
    }
  } catch (error) {
    console.log(error, '======error');
  }

  const { chainId, chainName, nativeCurrency, rpcUrls, blockExplorerUrls, iconUrls } = info;
  if (typeof info.chainId === 'string') {
    eventBus.emit(storages.userELFChainId, info.chainId);
    return true;
  }
  eventBus.emit(storages.userERCChainId, info.chainId);
  if (!provider?.request) {
    console.error("Can't setup the RPC network on metamask because window.ethereum is undefined");
    return false;
  }
  try {
    if (nativeCurrency && chainName) {
      console.log('====== ====== switchNetwork wallet_addEthereumChain', {
        chainId: `0x${chainId.toString(16)}`,
        chainName,
        nativeCurrency,
        rpcUrls,
        iconUrls,
        blockExplorerUrls,
      });
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${chainId.toString(16)}`,
            chainName,
            nativeCurrency,
            rpcUrls,
            iconUrls,
            blockExplorerUrls,
          },
        ],
      });
    } else {
      console.log('====== ====== switchNetwork wallet_switchEthereumChain', {
        chainId: `0x${chainId.toString(16)}`,
      });
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    }
    return true;
  } catch (error) {
    console.error('switchNetwork', error);
    return false;
  }
};
export function isChainAllowed(connector: Connector, chainId: number) {
  switch (connector.id) {
    case METAMASK_WALLET_ID:
    case COINBASE_WALLET_ID:
    case WALLET_CONNECT_ID:
      return ALL_SUPPORTED_CHAIN_IDS.includes(chainId);
    default:
      return false;
  }
}

function getChainIdFromFormattedString(item: string): number | null {
  const splitItem = item.startsWith('eip155:') ? item.split(':') : [];
  return splitItem.length > 1 && !isNaN(Number(splitItem[1])) ? Number(splitItem[1]) : null;
}
export function getSupportedChainIdsFromWalletConnectSession(session?: any): SupportedChainId[] {
  if (!session?.namespaces) return [];

  const eip155Keys = Object.keys(session.namespaces);
  const namespaces = Object.values(session.namespaces);

  // Collect all arrays into one for unified processing
  const allItems = [
    ...eip155Keys,
    ...namespaces.flatMap((namespace: any) => namespace.chains),
    ...namespaces.flatMap((namespace: any) => namespace.accounts),
  ];

  // Process all items to extract chainIds
  const allChainIds = allItems
    .map((item) => {
      if (typeof item === 'string') {
        return getChainIdFromFormattedString(item);
      }
      // Check if the item is a number
      return isNaN(Number(item)) ? null : Number(item);
    })
    .filter((item) => item !== null); // Filter out any null values

  return Array.from(new Set(allChainIds)) as SupportedChainId[];
}
export const switchChain = async (
  info: NetworkType['info'] & Info,
  connector?: Connector | string,

  isWeb3Active?: boolean,
  web3ChainId?: ChainId,
) => {
  const { chainId } = info;
  if (typeof chainId === 'string') {
    eventBus.emit(storages.userELFChainId, info.chainId);
    return true;
  }
  if (!isELFChain(info.chainId) && web3ChainId === info.chainId) return;
  eventBus.emit(storages.userERCChainId, info.chainId);
  if (!connector || typeof connector === 'string') return;
  if (isWeb3Active) {
    console.log('====== ====== ====== 0', connector, chainId);
    if (!isChainAllowed(connector, chainId)) {
      throw new Error(`Chain ${chainId} not supported for connector (${typeof connector})`);
    } else {
      const addChainParameter = {
        chainId: chainId,
      };
      console.log('====== ====== ====== 4', addChainParameter);
      await connector.connect(addChainParameter);
    }
  } else {
    console.log('====== ====== ====== 5', info);
    // unlink metamask
    await switchNetwork(info);
  }
};

export const getNetworkInfo = (chainId: ChainId) => {
  return NetworkList.find((info) => info.info.chainId === chainId);
};
