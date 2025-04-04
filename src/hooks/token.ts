import { useCallback, useEffect } from 'react';
import { useActiveWhitelist } from './whitelist';
import { ChainId, TokenInfo } from 'types';
import { BRIDGE_TOKEN_MAP } from 'constants/index';
import { getTokenPrice } from 'utils/api/common';
import { useTokenDispatch, useTokenPriceByContext } from 'contexts/useToken/hooks';
import { addTokenPrice } from 'contexts/useToken/actions';
import { useEVMSwitchChain } from './web3';
import { CREATE_TOKEN_ABI } from 'constants/abis';
import { getContract } from './useContract';
import { getBridgeChainInfo } from 'utils/chain';
import { createOfficialToken, createToken } from 'contracts';

export function useGetTokenInfoByWhitelist() {
  const activeWhitelist = useActiveWhitelist();
  return useCallback(
    (chainId?: ChainId, symbol?: string) => {
      if (!chainId || !symbol) return;
      try {
        return (activeWhitelist as any)[BRIDGE_TOKEN_MAP?.[symbol] || symbol]?.[chainId] as TokenInfo;
      } catch (error) {
        console.debug(error, 'useGetTokenInfoByWhitelist');
      }
    },
    [activeWhitelist],
  );
}

export function useTokenPrice(symbol1?: string) {
  const dispatch = useTokenDispatch();

  const price = useTokenPriceByContext(symbol1);
  const onGetTokenPrice = useCallback(
    async (symbol2?: string) => {
      const symbol = symbol2 || symbol1;
      if (!symbol) return '0';
      try {
        const req = await getTokenPrice({ symbol, amount: '1' });
        dispatch(addTokenPrice(symbol, req.tokenAmountInUsd));
        return req.tokenAmountInUsd;
      } catch (error) {
        console.debug(error, 'onGetTokenPrice');
      }
    },
    [dispatch, symbol1],
  );
  useEffect(() => {
    onGetTokenPrice();
  }, [onGetTokenPrice]);

  return { price, onGetTokenPrice };
}

export function useCallEVMCreateToken() {
  const evmSwitchChain = useEVMSwitchChain();

  return useCallback(
    async ({
      chainId,
      ...args
    }: {
      chainId: ChainId;
      account: string;
      name: string;
      symbol: string;
      initialSupply: string;
    }) => {
      await evmSwitchChain(chainId);
      const address = getBridgeChainInfo(chainId)?.CREATE_TOKEN_CONTRACT;
      const contract = getContract(address, CREATE_TOKEN_ABI, chainId);
      return createToken({ createTokenContract: contract, ...args });
    },
    [evmSwitchChain],
  );
}

export function useCallEVMCreateOfficialToken() {
  const evmSwitchChain = useEVMSwitchChain();

  return useCallback(
    async ({
      chainId,
      ...args
    }: {
      chainId: ChainId;
      account: string;
      name: string;
      symbol: string;
      initialSupply: string;
      officialAddress: string;
      mintToAddress: string;
    }) => {
      await evmSwitchChain(chainId);
      console.log('====== useCallEVMCreateOfficialToken', '');
      const address = getBridgeChainInfo(chainId)?.CREATE_TOKEN_CONTRACT;
      const contract = getContract(address, CREATE_TOKEN_ABI, chainId);
      console.log('====== useCallEVMCreateOfficialToken address', address, contract);
      return createOfficialToken({ createTokenContract: contract, ...args });
    },
    [evmSwitchChain],
  );
}
