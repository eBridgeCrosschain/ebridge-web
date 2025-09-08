import { BRIDGE_IN_ABI, BRIDGE_OUT_ABI, ERC20_ABI, CREATE_TOKEN_ABI, LIMIT_ABI, POOLS_ABI } from 'constants/abis';
import { useCallback, useEffect, useMemo } from 'react';
import { AelfInstancesKey, ChainId } from 'types';
import { getAElf, getNodeByChainId, getWallet, isELFChain } from 'utils/aelfUtils';
import { useAElf } from './web3';
import { ELFChainConstants, ERCChainConstants } from 'constants/ChainConstants';
import { isELFAddress, isTonChain, sleep } from 'utils';
import { AElfDappBridge } from '@aelf-react/types';
import { checkAElfBridge } from 'utils/checkAElfBridge';
import { setContract } from 'contexts/useAElfContract/actions';
import { useAElfContractContext } from 'contexts/useAElfContract';
import { ContractBasic, PortkeySDKContractBasic } from 'utils/contract';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { getContractBasic } from '@portkey/contracts';
import { SupportedTONChain, WEB_LOGIN_CONFIG } from 'constants/index';
import { IContract } from '@portkey/types';
import { ExtraInfoForDiscover, WebLoginWalletInfo } from 'types/wallet';
import { useGetAccount } from './wallet';
import { SupportedELFChainId } from 'constants/chain';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { getBridgeChainInfo } from 'utils/chain';
import { getPortkeyWebWalletInfo } from 'utils/portkey';
import detectProvider from '@portkey/detect-provider';

const ContractMap: { [key: string]: ContractBasic } = {};

export function getContract(address: string, ABI: any, chainId?: ChainId) {
  return new ContractBasic({
    contractAddress: address,
    contractABI: ABI,
    chainId,
  });
}

export const getPortkeyContract = async (
  contractAddress: string,
  chainId: ChainId,
  walletInfo: WebLoginWalletInfo,
  walletType: WalletTypeEnum,
) => {
  const key = `${contractAddress}_${chainId}_${walletInfo?.address}_${walletInfo}`;
  if (walletType === WalletTypeEnum.discover) {
    if (!ContractMap[key]) {
      const portkeyDiscoverInfo = walletInfo?.extraInfo as ExtraInfoForDiscover;
      if (!portkeyDiscoverInfo.provider) throw new Error('Portkey Provider undefined');
      const portkeyChain = await portkeyDiscoverInfo.provider.getChain(chainId as any);
      const contract = new ContractBasic({
        contractAddress,
        chainId,
        portkeyChain,
      });
      ContractMap[key] = contract;
    }
    return ContractMap[key];
  } else {
    const portkeyAAInfo = getPortkeyWebWalletInfo();
    let sdkContract: undefined | IContract;
    let caContract: undefined | IContract;
    if (portkeyAAInfo) {
      const portkeyConfig = WEB_LOGIN_CONFIG.portkeyV2;
      sdkContract = await getContractBasic({
        chainType: 'aelf',
        account: { address: portkeyAAInfo?.caAddress },
        contractAddress: contractAddress,
        caContractAddress: portkeyConfig.caContractAddress[chainId as keyof typeof portkeyConfig.caContractAddress],
        callType: 'ca',
        caHash: portkeyAAInfo?.caHash || '',
        rpcUrl: getNodeByChainId(chainId).rpcUrl,
      });
      caContract = await getContractBasic({
        chainType: 'aelf',
        account: { address: portkeyAAInfo?.caAddress },
        contractAddress: portkeyConfig.caContractAddress[chainId as keyof typeof portkeyConfig.caContractAddress],
        callType: 'eoa',
        rpcUrl: getNodeByChainId(chainId).rpcUrl,
      });
    }
    const viewInstance = chainId ? getAElf(chainId) : null;
    const viewContract = await viewInstance?.chain.contractAt(contractAddress, getWallet());

    const sdkContractBasic = new PortkeySDKContractBasic({
      sdkContract,
      viewContract,
      chainId,
      contractAddress,
      portkeyWallet: walletInfo,
      caContract,
    });
    return sdkContractBasic as unknown as ContractBasic;
  }
};

export const getFairyVaultContract = async (
  contractAddress: string,
  chainId: ChainId,
  walletInfo: WebLoginWalletInfo,
  walletType: WalletTypeEnum,
) => {
  const key = `${contractAddress}_${chainId}_${walletInfo?.address}_${walletInfo}_${walletType}`;
  if (!ContractMap[key]) {
    const provider = await detectProvider({ providerName: 'FairyVault' });
    const fairyVaultChain = await provider?.getChain(chainId as any);
    const contract = new ContractBasic({
      contractAddress,
      chainId,
      fairyVaultChain,
    });
    ContractMap[key] = contract;
  }
  return ContractMap[key];
};

export function useERCContract(address: string | undefined, ABI: any, chainId?: ChainId) {
  return useMemo(() => {
    if (!address || isELFChain(chainId) || isTonChain(chainId)) return undefined;
    try {
      return getContract(address, ABI, chainId);
    } catch (error) {
      console.log(error, '====useERCContract');
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ABI, address]);
}

export async function getELFContract(
  contractAddress: string,
  aelfInstance?: AElfDappBridge,
  account?: string,
  chainId?: ChainId,
) {
  const key = contractAddress + account + chainId + aelfInstance?.chainId || '';
  if (!ContractMap[key]) {
    const viewInstance = chainId ? getAElf(chainId) : null;
    const wallet = account ? { address: account } : getWallet();
    if (aelfInstance) await checkAElfBridge(aelfInstance);
    const [viewContract, aelfContract] = await Promise.all([
      viewInstance?.chain.contractAt(contractAddress, getWallet()),
      aelfInstance?.chain.contractAt(contractAddress, wallet),
    ]);

    ContractMap[key] = new ContractBasic({
      aelfContract,
      contractAddress,
      chainId,
      aelfInstance,
      viewContract,
    });
  }
  return ContractMap[key];
}

export function useAElfContract(contractAddress: string, chainId?: ChainId) {
  const { account, aelfInstances } = useAElf();
  const [contracts, { dispatch }] = useAElfContractContext();
  const aelfInstance = useMemo(() => aelfInstances?.[chainId as AelfInstancesKey], [aelfInstances, chainId]);
  const key = useMemo(() => contractAddress + '_' + chainId + '_' + account, [account, chainId, contractAddress]);
  const getContract = useCallback(
    async (reCount = 0) => {
      if (!chainId || !contractAddress) return;
      try {
        const contract = await getELFContract(contractAddress, aelfInstance, account, chainId);
        dispatch(setContract({ [key]: contract }));
      } catch (error) {
        await sleep(1000);
        reCount++;
        if (reCount < 20) {
          getContract(reCount);
        } else {
          console.warn(error, reCount, '====getContract', contractAddress);
        }
      }
    },
    [chainId, aelfInstance, contractAddress, account, dispatch, key],
  );

  useEffect(() => {
    getContract();
  }, [getContract]);

  return useMemo(() => {
    return contracts?.[key];
  }, [contracts, key]);
}

export function useTonContract(contractAddress: string, chainId?: ChainId) {
  const [tonConnectUI] = useTonConnectUI();

  return useMemo(() => {
    if (!isTonChain(chainId)) return;
    return new ContractBasic({ contractAddress, chainId, tonConnectUI });
  }, [chainId, contractAddress, tonConnectUI]);
}

export function usePortkeyContract(contractAddress: string, chainId?: SupportedELFChainId) {
  const { walletType, walletInfo } = useConnectWallet();
  const accounts = useGetAccount();

  const account: string = useMemo(() => {
    if (!chainId) return '';
    return accounts?.[chainId] || '';
  }, [accounts, chainId]);
  const [contracts, { dispatch }] = useAElfContractContext();
  const key = useMemo(() => `${contractAddress}_${chainId}_${account}`, [account, chainId, contractAddress]);
  const getContract = useCallback(
    async (reCount = 0) => {
      if (!chainId || !isELFChain(chainId) || !isELFAddress(contractAddress)) return;
      try {
        dispatch(
          setContract({
            [key]: await getPortkeyContract(contractAddress, chainId, walletInfo as WebLoginWalletInfo, walletType),
          }),
        );
      } catch (error) {
        console.log(error, '====error-getContract');
        await sleep(1000);
        reCount++;
        if (reCount < 5) {
          getContract(reCount);
        } else {
          console.warn(error, reCount, '====getContract', contractAddress);
        }
      }
    },
    [chainId, contractAddress, dispatch, key, walletInfo, walletType],
  );

  useEffect(() => {
    getContract();
  }, [getContract]);

  return useMemo(() => {
    return contracts?.[key];
  }, [contracts, key]);
}

export function useFairyVaultContract(contractAddress: string, chainId?: SupportedELFChainId) {
  const { walletType, walletInfo } = useConnectWallet();
  const accounts = useGetAccount();
  const account: string = useMemo(() => {
    if (!chainId) return '';
    return accounts?.[chainId] || '';
  }, [accounts, chainId]);
  const [contracts, { dispatch }] = useAElfContractContext();
  const key = useMemo(() => `${contractAddress}_${chainId}_${account}_FairyVault`, [account, chainId, contractAddress]);
  const getContract = useCallback(
    async (reCount = 0) => {
      if (
        !chainId ||
        !isELFChain(chainId) ||
        !isELFAddress(contractAddress) ||
        !walletInfo ||
        walletType !== WalletTypeEnum.fairyVault
      )
        return;
      try {
        dispatch(
          setContract({
            [key]: await getFairyVaultContract(contractAddress, chainId, walletInfo as WebLoginWalletInfo, walletType),
          }),
        );
      } catch (error) {
        console.log(error, '====error-getContract-useFairyVaultContract');
        await sleep(1000);
        reCount++;
        if (reCount < 5) {
          getContract(reCount);
        } else {
          console.warn(error, reCount, '====getContract-useFairyVaultContract', contractAddress);
        }
      }
    },
    [chainId, contractAddress, dispatch, key, walletInfo, walletType],
  );

  useEffect(() => {
    getContract();
  }, [getContract]);

  return useMemo(() => {
    return contracts?.[key];
  }, [contracts, key]);
}

function useContract(address: string, ABI: any, chainId?: ChainId, isPortkey?: boolean): ContractBasic | undefined {
  const ercContract = useERCContract(address, ABI, chainId);
  const elfContract = useAElfContract(address, chainId);
  const tonContract = useTonContract(address, chainId);
  const portkeyContract = usePortkeyContract(address, chainId as SupportedELFChainId);
  const fairyVaultContract = useFairyVaultContract(address, chainId as SupportedELFChainId);

  const { walletType } = useConnectWallet();
  return useMemo(() => {
    const isFairyVault = walletType === WalletTypeEnum.fairyVault;
    if (isPortkey) return portkeyContract;
    if (isTonChain(chainId)) return tonContract;
    return isELFChain(chainId) ? (isFairyVault ? fairyVaultContract : elfContract) : ercContract;
  }, [chainId, elfContract, ercContract, fairyVaultContract, isPortkey, portkeyContract, tonContract, walletType]);
}

export function useTokenContract(chainId?: ChainId, address?: string, isPortkey?: boolean) {
  const contractAddress = useMemo(() => {
    if (isELFChain(chainId)) return ELFChainConstants.constants[chainId as AelfInstancesKey].TOKEN_CONTRACT;
    return address;
  }, [address, chainId]);
  return useContract(contractAddress || '', ERC20_ABI, chainId, isPortkey);
}
export function useCrossChainContract(chainId?: ChainId, address?: string, isPortkey?: boolean) {
  const contractAddress = useMemo(() => {
    if (isELFChain(chainId)) return ELFChainConstants.constants[chainId as AelfInstancesKey].CROSS_CHAIN_CONTRACT;
    return address;
  }, [address, chainId]);
  return useContract(contractAddress || '', ERC20_ABI, chainId, isPortkey);
}

export function useBridgeContract(chainId?: ChainId, isPortkey?: boolean) {
  const contractAddress = useMemo(() => {
    if (isELFChain(chainId)) return ELFChainConstants.constants[chainId as AelfInstancesKey]?.BRIDGE_CONTRACT;
    if (chainId && isTonChain(chainId)) return SupportedTONChain[chainId].BRIDGE_CONTRACT;
    return ERCChainConstants.constants?.BRIDGE_CONTRACT;
  }, [chainId]);

  return useContract(contractAddress || '', BRIDGE_IN_ABI, chainId, isPortkey);
}
export function useBridgeOutContract(chainId?: ChainId, isPortkey?: boolean) {
  const contractAddress = useMemo(() => {
    if (isELFChain(chainId)) return ELFChainConstants.constants[chainId as AelfInstancesKey]?.BRIDGE_CONTRACT;
    return ERCChainConstants.constants?.BRIDGE_CONTRACT_OUT;
  }, [chainId]);
  return useContract(contractAddress || '', BRIDGE_OUT_ABI, chainId, isPortkey);
}

export function useLimitContract(fromChainId?: ChainId, toChainId?: ChainId, symbol?: string) {
  const contractAddress = useMemo(() => {
    // TON chain limit contract is equal to token pool contract
    if (fromChainId && isTonChain(fromChainId) && symbol) {
      const fromChainInfo = getBridgeChainInfo(fromChainId);
      return fromChainInfo?.TOKEN_POOL_MAP[symbol];
    }
    return ERCChainConstants?.constants?.LIMIT_CONTRACT || '';
  }, [fromChainId, symbol]);

  return useContract(contractAddress, LIMIT_ABI, isELFChain(fromChainId) ? toChainId : fromChainId);
}

export function useCreateTokenContract(chainId?: ChainId) {
  const contractAddress = useMemo(() => {
    if (isELFChain(chainId) || isTonChain(chainId)) return '';
    return ERCChainConstants.constants.CREATE_TOKEN_CONTRACT || '';
  }, [chainId]);
  return useContract(contractAddress, CREATE_TOKEN_ABI, chainId, false);
}

export function usePoolContract(chainId?: ChainId, address?: string, isPortkey?: boolean, symbol?: string) {
  const contractAddress = useMemo(() => {
    const chainInfo = getBridgeChainInfo(chainId);
    // TON chain one token corresponds to one fund pool address
    if (isTonChain(chainId) && symbol) return chainInfo?.TOKEN_POOL_MAP[symbol];
    return chainInfo?.TOKEN_POOL || '';
  }, [chainId, symbol]);
  return useContract(address || contractAddress, POOLS_ABI, chainId, isPortkey);
}
