import Web3 from 'web3';
import { provider } from 'web3-core';
import { AbiItem } from 'web3-utils/types';
import { Contract } from 'web3-eth-contract';
import BigNumber from 'bignumber.js';
import { ContractBasic } from '../utils/contract';
import { ERC20_ABI } from 'constants/abis';
import { MaxUint256, REQ_CODE } from 'constants/misc';
import { isUserDenied } from 'utils/provider';
import CommonMessage from 'components/CommonMessage';
import { ChainId } from 'types';
import { handleErrorMessage } from 'utils/error';

// ethereum
export const getContract = (provider: provider, address: string) => {
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(ERC20_ABI as unknown as AbiItem, address);
  return contract;
};

export const callERC20ViewMethod = async (
  functionName: string,
  provider: provider,
  nftAddress: string,
  paramsOption?: any,
): Promise<string> => {
  try {
    const contract = getContract(provider, nftAddress);
    if (paramsOption) {
      return await contract.methods[functionName](paramsOption).call();
    }
    return await contract.methods[functionName]().call();
  } catch (e) {
    console.debug('callNFTShardsViewMethod error', e);
    return '0';
  }
};

export const getAllowance = async (
  lpContract: Contract,
  masterChefContract: Contract,
  account: string,
): Promise<string> => {
  try {
    const allowance: string = await lpContract.methods.allowance(account, masterChefContract.options.address).call();
    return allowance;
  } catch (e) {
    return '0';
  }
};

export const getBalance = async (provider: provider, tokenAddress: string, userAddress: string): Promise<string> => {
  try {
    const lpContract = getContract(provider, tokenAddress);
    const balance: string = await lpContract.methods.balanceOf(userAddress).call();
    return balance;
  } catch (e) {
    return '0';
  }
};
export const getTotalSupply = async (provider: provider, tokenAddress: string): Promise<string> => {
  try {
    const lpContract = getContract(provider, tokenAddress);
    return await lpContract.methods.totalSupply().call();
  } catch (e) {
    return '0';
  }
};

export const checkErcApprove = async (
  fromChainId: ChainId,
  contractAddress: string,
  account: string,
  approveTargetAddress: string,
  contractUseAmount?: string | number,
  pivotBalance?: string | number,
): Promise<boolean | any> => {
  const lpContract = new ContractBasic({
    contractABI: ERC20_ABI,
    contractAddress: contractAddress,
    chainId: fromChainId,
  });
  const approveResult = await checkAllowanceAndApprove({
    erc20Contract: lpContract,
    approveTargetAddress,
    account,
    contractUseAmount,
    pivotBalance,
  });
  if (typeof approveResult !== 'boolean' && approveResult.error) {
    CommonMessage.error('Check allowance and Approved failed');
    CommonMessage.error(handleErrorMessage(approveResult));
    if (isUserDenied(approveResult.error.details)) return REQ_CODE.UserDenied;
    return REQ_CODE.Fail;
  }
  return REQ_CODE.Success;
};

export const checkAllowanceAndApprove = async ({
  erc20Contract,
  approveTargetAddress,
  account,
  contractUseAmount,
  pivotBalance,
}: {
  erc20Contract: ContractBasic;
  approveTargetAddress: string;
  account: string;
  contractUseAmount?: string | number;
  pivotBalance?: string | number;
}): Promise<boolean | any> => {
  const [allowance, decimals] = await Promise.all([
    erc20Contract.callViewMethod('allowance', [account, approveTargetAddress]),
    erc20Contract.callViewMethod('decimals'),
  ]);
  if (allowance.error) {
    return allowance;
  }
  const allowanceBN = new BigNumber(allowance);
  const pivotBalanceBN = contractUseAmount
    ? new BigNumber(contractUseAmount)
    : new BigNumber(pivotBalance || 1).times(10 ** decimals);
  if (allowanceBN.lt(pivotBalanceBN)) {
    const approveResult = await erc20Contract.callSendMethod('approve', account, [approveTargetAddress, MaxUint256]);
    if (approveResult.error) {
      return approveResult;
    } else {
      return approveResult;
    }
  }
  return true;
};

export const createToken = async ({
  createTokenContract,
  account,
  name,
  symbol,
  initialSupply,
}: {
  createTokenContract: ContractBasic;
  account: string;
  name: string;
  symbol: string;
  initialSupply: string;
}) => {
  return createTokenContract.callSendMethod('createToken', account, [name, symbol, initialSupply], {
    onMethod: 'transactionHash',
  });
};

export const createOfficialToken = async ({
  createTokenContract,
  account,
  name,
  symbol,
  initialSupply,
  officialAddress,
  mintToAddress,
}: {
  createTokenContract: ContractBasic;
  account: string;
  name: string;
  symbol: string;
  initialSupply: string;
  officialAddress: string;
  mintToAddress: string;
}) => {
  return createTokenContract.callSendMethod(
    'createOfficialToken',
    account,
    [name, symbol, initialSupply, officialAddress, mintToAddress],
    {
      onMethod: 'transactionHash',
    },
  );
};
