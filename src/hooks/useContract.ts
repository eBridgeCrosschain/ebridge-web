import { BRIDGE_IN_ABI, BRIDGE_OUT_ABI, ERC20_ABI, LIMIT_ABI } from 'constants/abis';
import { useCallback, useEffect, useMemo } from 'react';
import { AelfInstancesKey, ChainId } from 'types';
import { getAElf, getNodeByChainId, getWallet, isELFChain } from 'utils/aelfUtils';
import { provider } from 'web3-core';
import { useAElf, useWeb3 } from './web3';
import { ELFChainConstants, ERCChainConstants } from 'constants/ChainConstants';
import { sleep } from 'utils';
import { AElfDappBridge } from '@aelf-react/types';
import { checkAElfBridge } from 'utils/checkAElfBridge';
import { setContract } from 'contexts/useAElfContract/actions';
import { useAElfContractContext } from 'contexts/useAElfContract';
import { ContractBasic, PortkeySDKContractBasic } from 'utils/contract';
import { WalletType } from 'aelf-web-login';
import { useLoginWalletContext } from 'contexts/useLoginWallet/provider';
import { ILoginWalletContextType } from 'contexts/useLoginWallet/types';
import { getContractBasic } from '@portkey/contracts';
import { WEB_LOGIN_CONFIG } from 'constants/index';
import { IContract } from '@portkey/types';

const ContractMap: { [key: string]: ContractBasic } = {};

export function getContract(address: string, ABI: any, library?: provider) {
  return new ContractBasic({
    contractAddress: address,
    contractABI: ABI,
    provider: library,
  });
}

export const getPortkeyContract = async (
  contractAddress: string,
  chainId: ChainId,
  portkeyWallet: ILoginWalletContextType,
) => {
  const { loginWalletType, wallet, version, provider } = portkeyWallet;
  const key = `${contractAddress}_${chainId}_${wallet?.address}_${version}_${loginWalletType}`;
  if (loginWalletType === WalletType.discover) {
    if (ContractMap[key]) return ContractMap[key];
    if (!provider) throw new Error('Portkey Provider undefined');
    const portkeyChain = await provider.getChain(chainId as any);
    const contract = new ContractBasic({
      contractAddress,
      chainId,
      portkeyChain,
    });
    ContractMap[key] = contract;
    return contract;
  } else {
    const account = wallet?.portkeyInfo?.walletInfo;
    let sdkContract: undefined | IContract;
    let caContract: undefined | IContract;
    if (account) {
      const portkeyConfig = version === 'v1' ? WEB_LOGIN_CONFIG.portkey : WEB_LOGIN_CONFIG.portkeyV2;
      sdkContract = await getContractBasic({
        chainType: 'aelf',
        account,
        contractAddress: contractAddress,
        caContractAddress: portkeyConfig.caContractAddress[chainId as keyof typeof portkeyConfig.caContractAddress],
        callType: 'ca',
        caHash: wallet.portkeyInfo?.caInfo.caHash || '',
        rpcUrl: getNodeByChainId(chainId).rpcUrl,
      });
      caContract = await getContractBasic({
        chainType: 'aelf',
        account,
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
      portkeyWallet,
      caContract,
    });
    return sdkContractBasic as unknown as ContractBasic;
  }
};
export function useERCContract(address: string | undefined, ABI: any, chainId?: ChainId) {
  const { library } = useWeb3();
  return useMemo(() => {
    if (!address || isELFChain(chainId)) return undefined;
    try {
      return getContract(address, ABI, library);
    } catch (error) {
      console.log(error, '====useERCContract');
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ABI, address, library]);
}

export async function getELFContract(
  contractAddress: string,
  aelfInstance: AElfDappBridge,
  account?: string,
  chainId?: ChainId,
) {
  const viewInstance = chainId ? getAElf(chainId) : null;
  const wallet = account ? { address: account } : getWallet();
  await checkAElfBridge(aelfInstance);
  if (aelfInstance.connect) {
    const [viewContract, aelfContract] = await Promise.all([
      viewInstance?.chain.contractAt(contractAddress, getWallet()),
      aelfInstance?.chain.contractAt(contractAddress, wallet),
    ]);

    return new ContractBasic({
      aelfContract,
      contractAddress,
      chainId,
      aelfInstance,
      viewContract,
    });
  }
  const aelfContract = await aelfInstance?.chain.contractAt(contractAddress, wallet);
  return new ContractBasic({
    aelfContract,
    contractAddress,
    chainId,
    aelfInstance,
    viewContract: aelfContract,
  });
}

export function useAElfContract(contractAddress: string, chainId?: ChainId) {
  const { account, aelfInstances } = useAElf();
  const [contracts, { dispatch }] = useAElfContractContext();
  const aelfInstance = useMemo(() => aelfInstances?.[chainId as AelfInstancesKey], [aelfInstances, chainId]);
  const key = useMemo(() => contractAddress + '_' + chainId + '_' + account, [account, chainId, contractAddress]);
  const getContract = useCallback(
    async (reCount = 0) => {
      if (!chainId || !aelfInstance || !contractAddress) return;
      try {
        const contract = await getELFContract(contractAddress, aelfInstance, account, chainId);
        dispatch(setContract({ [key]: contract }));
      } catch (error) {
        await sleep(1000);
        reCount++;
        if (reCount < 20) {
          getContract(reCount);
        } else {
          console.error(error, reCount, '====getContract', contractAddress);
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

export function usePortkeyContract(contractAddress: string, chainId?: ChainId) {
  const portkeyWallet = useLoginWalletContext();
  const { accounts, isActive, version } = portkeyWallet;
  const account: string = useMemo(() => {
    if (!chainId || !isActive) return '';
    return (accounts as any)?.[chainId]?.[0];
  }, [accounts, chainId, isActive]);
  const [contracts, { dispatch }] = useAElfContractContext();
  const key = useMemo(
    () => `${contractAddress}_${chainId}_${account}_${version}`,
    [account, chainId, contractAddress, version],
  );
  const getContract = useCallback(
    async (reCount = 0) => {
      if (!chainId || !isELFChain(chainId)) return;
      try {
        dispatch(
          setContract({
            [key]: await getPortkeyContract(contractAddress, chainId, portkeyWallet),
          }),
        );
      } catch (error) {
        console.log(error, '====error');
        await sleep(1000);
        reCount++;
        if (reCount < 5) {
          getContract(reCount);
        } else {
          console.error(error, reCount, '====getContract', contractAddress);
        }
      }
    },
    [chainId, contractAddress, dispatch, key, portkeyWallet],
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
  const portkeyContract = usePortkeyContract(address, chainId);
  return useMemo(() => {
    if (isPortkey) return portkeyContract;
    return isELFChain(chainId) ? elfContract : ercContract;
  }, [chainId, elfContract, ercContract, isPortkey, portkeyContract]);
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

export function useLimitContract(fromChainId?: ChainId, toChainId?: ChainId) {
  return useERCContract(
    ERCChainConstants.constants.LIMIT_CONTRACT || '',
    LIMIT_ABI,
    isELFChain(fromChainId) ? toChainId : fromChainId,
  );
}
