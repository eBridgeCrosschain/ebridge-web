import { message } from 'antd';
import { getExploreLink, isELFAddress, shortenString, sleep } from 'utils';
import BigNumber from 'bignumber.js';
import { ContractBasic } from './contract';
import AElf from 'aelf-sdk';
import { AElfNodes, COMMON_PRIVATE } from 'constants/aelf';
import { baseRequest } from 'api';
import descriptor from '@aelfqueen/protobufjs/ext/descriptor';
import { timesDecimals } from './calculate';
import { isSymbol } from './reg';
import { SupportedELFChainId } from 'constants/chain';
import storages from 'constants/storages';
import { isMobileDevices } from './isMobile';
import { AelfInstancesKey, ChainId } from 'types';
import type { AElfWallet } from '@aelf-react/types';
import CommonMessage from 'components/CommonMessage';
const Wallet = AElf.wallet;

let wallet: AElfWallet;
const httpProviders: any = {};

export function getNodeByChainId(chainId: ChainId) {
  return AElfNodes[chainId as AelfInstancesKey];
}

export function getAElf(chainId: ChainId) {
  const rpc = getNodeByChainId(chainId).rpcUrl;
  if (!httpProviders[rpc]) httpProviders[rpc] = new AElf(new AElf.providers.HttpProvider(rpc));
  return httpProviders[rpc];
}

export function getWallet() {
  if (!wallet) wallet = Wallet.getWalletByPrivateKey(COMMON_PRIVATE);
  return wallet;
}

export const approveELF = async (
  address: string,
  tokenContract: ContractBasic,
  symbol = 'ELF',
  amount: BigNumber | number | string,
  chainId: ChainId,
) => {
  const approveResult = await tokenContract.callSendMethod('Approve', '', [address, symbol, amount.toString()]);
  if (approveResult.error) {
    CommonMessage.error(
      approveResult.error.message || approveResult?.errorMessage?.message || approveResult.errorMessage,
    );
    return false;
  }
  const { TransactionId } = approveResult.result || approveResult;
  await MessageTxToExplore(chainId, TransactionId);
  return true;
};

export function getBlockHeight(chainId: ChainId) {
  return getAElf(chainId).chain.getBlockHeight();
}
export function getSerializedDataFromLog(log: any) {
  return AElf.pbUtils.getSerializedDataFromLog(log);
}
export async function getTxResult(
  chainId: ChainId,
  TransactionId: string,
  reGetCount = 0,
  notExistedReGetCount = 0,
): Promise<any> {
  const txFun = getAElf(chainId).chain.getTxResult;
  const txResult = await txFun(TransactionId);

  if (txResult.error && txResult.errorMessage) {
    throw Error(txResult.errorMessage.message || txResult.errorMessage.Message);
  }
  const result = txResult?.result || txResult;

  if (!result) {
    throw Error('Can not get transaction result.');
  }
  const lowerCaseStatus = result.Status.toLowerCase();

  if (lowerCaseStatus === 'notexisted') {
    if (notExistedReGetCount > 5) return result;
    await sleep(1000);
    notExistedReGetCount++;
    reGetCount++;
    return getTxResult(chainId, TransactionId, reGetCount, notExistedReGetCount);
  }

  if (lowerCaseStatus === 'pending' || lowerCaseStatus === 'pending_validation') {
    if (reGetCount > 20) return result;
    await sleep(1000);
    reGetCount++;
    return getTxResult(chainId, TransactionId, reGetCount, notExistedReGetCount);
  }

  if (lowerCaseStatus === 'mined') {
    return result;
  }

  throw Error(result.Error || `Transaction: ${result.Status}`);
}
export function messageHTML(txId: string, type: 'success' | 'error' | 'warning' = 'success', moreMessage = '') {
  const aProps = isMobileDevices() ? {} : { target: '_blank', rel: 'noreferrer' };
  const explorerHref = getExploreLink(txId, 'transaction');
  const txIdHTML = (
    <span>
      <span>
        Transaction Id: &nbsp;
        <a href={explorerHref} style={{ wordBreak: 'break-all' }} {...aProps}>
          {shortenString(txId || '', 8)}
        </a>
      </span>
      <br />
      {moreMessage && <span>{moreMessage.replace('AElf.Sdk.CSharp.AssertionException:', '')}</span>}
    </span>
  );
  message[type](txIdHTML, 10);
}

export async function MessageTxToExplore(
  chainId: ChainId,
  txId: string,
  type: 'success' | 'error' | 'warning' = 'success',
) {
  try {
    const { TransactionId: validTxId } = await getTxResult(chainId, txId);
    messageHTML(validTxId, type);
  } catch (e: any) {
    if (e.TransactionId) {
      messageHTML(txId, 'error', e.Error || 'Transaction error.');
    } else {
      messageHTML(txId, 'error', e.message || 'Transaction error.');
    }
  }
}
export const checkElfAllowanceAndApprove = async (
  tokenContract: ContractBasic,
  symbol: string,
  address: string,
  approveTargetAddress: string,
  amount: string | number,
  chainId: ChainId,
): Promise<
  | boolean
  | {
      error: Error;
    }
> => {
  const [allowance, tokenInfo] = await Promise.all([
    tokenContract.callViewMethod('GetAllowance', [symbol, address, approveTargetAddress]),
    tokenContract.callViewMethod('GetTokenInfo', [symbol]),
  ]);
  if (allowance?.error) {
    CommonMessage.error(allowance.error.message || allowance.errorMessage?.message || allowance.errorMessage);
    return false;
  }
  const bigA = timesDecimals(amount, tokenInfo?.decimals ?? 8);
  const allowanceBN = new BigNumber(allowance?.allowance);
  if (allowanceBN.lt(bigA)) {
    return await approveELF(approveTargetAddress, tokenContract, symbol, bigA, chainId);
  }
  return true;
};

export async function initContracts(contracts: { [name: string]: string }, aelfInstance: any, account?: string) {
  const contractList = Object.entries(contracts);
  try {
    const list = await Promise.all(
      contractList.map(async ([, address]) => {
        try {
          const contract = await aelfInstance.chain.contractAt(address, account ? { address: account } : getWallet());
          return contract;
        } catch (error) {
          console.debug(error, aelfInstance, '=====contractAt');
          return undefined;
        }
      }),
    );
    const obj: any = {};
    contractList.forEach(([, value], index) => {
      obj[value] = list[index];
    });

    return obj;
  } catch (error) {
    console.log(error, 'initContracts');
  }
}
function setContractsFileDescriptorBase64(key: string, contracts: any) {
  localStorage.setItem(key, JSON.stringify(contracts));
}
function fileDescriptorSetFormatter(result: any) {
  const buffer = Buffer.from(result, 'base64');
  return descriptor.FileDescriptorSet.decode(buffer);
}
export async function getContractFileDescriptorSet(chainId: ChainId, address: string): Promise<any> {
  const key = storages.contractsFileDescriptorBase64 + chainId;
  let base64s: any = localStorage.getItem(key);
  const node = getNodeByChainId(chainId);
  base64s = JSON.parse(base64s);
  if (base64s && base64s[address]) {
    try {
      return fileDescriptorSetFormatter(base64s[address]);
    } catch (error) {
      delete base64s[address];
      setContractsFileDescriptorBase64(key, base64s);
      return getContractFileDescriptorSet(chainId, address);
    }
  } else {
    try {
      if (!base64s) base64s = {};
      const base64 = await baseRequest({
        url: `${node.rpcUrl}/api/blockChain/contractFileDescriptorSet`,
        params: { address },
        method: 'GET',
      });
      const fds = fileDescriptorSetFormatter(base64);
      base64s[address] = base64;
      setContractsFileDescriptorBase64(key, base64s);
      return fds;
    } catch (error) {
      console.debug(error, '======getContractFileDescriptorSet');
    }
  }
}

export const getServicesFromFileDescriptors = (descriptors: any) => {
  const root = AElf.pbjs.Root.fromDescriptor(descriptors, 'proto3').resolveAll();
  return descriptors.file
    .filter((f: any) => f.service.length > 0)
    .map((f: any) => {
      const sn = f.service[0].name;
      const fullName = f.package ? `${f.package}.${sn}` : sn;
      return root.lookupService(fullName);
    });
};
const isWrappedBytes = (resolvedType: any, name: string) => {
  if (!resolvedType?.name || resolvedType.name !== name) {
    return false;
  }
  if (!resolvedType?.fieldsArray || resolvedType.fieldsArray.length !== 1) {
    return false;
  }
  return resolvedType?.fieldsArray[0].type === 'bytes';
};
const isAddress = (resolvedType: any) => isWrappedBytes(resolvedType, 'Address');

const isHash = (resolvedType: any) => isWrappedBytes(resolvedType, 'Hash');
export function transformArrayToMap(inputType: any, origin: any[]) {
  if (!origin) return '';
  if (!Array.isArray(origin)) return origin;
  if (origin.length === 0) return '';
  if (isAddress(inputType) || isHash(inputType)) return origin[0];

  const { fieldsArray } = inputType || {};
  const fieldsLength = (fieldsArray || []).length;

  if (fieldsLength === 0) return origin;

  if (fieldsLength === 1) {
    const i = fieldsArray[0];
    return { [i.name]: origin[0] };
  }

  let result = origin;
  Array.isArray(fieldsArray) &&
    Array.isArray(origin) &&
    fieldsArray.forEach((i, k) => {
      result = {
        ...result,
        [i.name]: origin[k],
      };
    });
  return result;
}

export async function getContractMethods(chainId: ChainId, address: string) {
  const fds = await getContractFileDescriptorSet(chainId, address);
  const services = getServicesFromFileDescriptors(fds);
  const obj: any = {};
  Object.keys(services).forEach((key) => {
    const service = services[key];
    Object.keys(service.methods).forEach((key) => {
      const method = service.methods[key].resolve();
      obj[method.name] = method.resolvedRequestType;
    });
  });
  return obj;
}

export const isElfChainSymbol = (symbol?: string | null) => {
  if (symbol && symbol.length >= 2 && symbol.length <= 10 && isSymbol(symbol)) return symbol;
  return false;
};

export const isELFChain = (chainId?: ChainId) => {
  return !!(typeof chainId === 'string' && SupportedELFChainId[chainId as SupportedELFChainId]);
};

export const getRawTx = ({
  blockHeight,
  blockHash,
  packedInput,
  methodName,
  contractAddress,
  account,
}: {
  account: string;
  methodName: string;
  contractAddress: string;
  blockHeight: number;
  blockHash: string;
  packedInput: any;
}) => {
  const rawTx = AElf.pbUtils.getTransaction(account, contractAddress, methodName, packedInput);
  rawTx.refBlockNumber = blockHeight;
  rawTx.refBlockPrefix = Buffer.from(blockHash, 'hex').slice(0, 4);
  return rawTx;
};

export const encodedTransfer = ({ params, inputType }: { params: any; inputType: any }) => {
  let input = AElf.utils.transform.transformMapToArray(inputType, params);

  input = AElf.utils.transform.transform(inputType, input, AElf.utils.transform.INPUT_TRANSFORMERS);

  const message = inputType.fromObject(input);
  return inputType.encode(message).finish();
};

export const encodeTransaction = (tx: any) => {
  return AElf.pbUtils.encodeTransaction(tx);
};

export const uint8ArrayToHex = (tx: any) => {
  return AElf.utils.uint8ArrayToHex(tx);
};

export const getELFAddress = (address?: string) => {
  if (!address) return;
  const list = address.split('_');
  if (list.length === 3 && isELFAddress(list[1])) return list[1];
};
