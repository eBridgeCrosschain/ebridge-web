/* eslint-disable react/no-is-mounted */
import { SupportedELFChain, WEB_LOGIN_CONFIG } from '../constants';
import { ELFChainConstants, ERCChainConstants } from 'constants/ChainConstants';
import { getContractMethods, transformArrayToMap, getTxResult, isELFChain, encodedTransfer } from './aelfUtils';
import { ChainId, ChainType } from 'types';
import { isTonChain, sleep } from 'utils';
import { AElfDappBridge } from '@aelf-react/types';
import { checkAElfBridge } from './checkAElfBridge';
import { IAElfChain } from '@portkey/provider-types';
import { IContract } from '@portkey/types';
import { PortkeyDid } from '@aelf-web-login/wallet-adapter-bridge';
import { ExtraInfoForPortkeyAA, WebLoginWalletInfo } from 'types/wallet';
import { TonConnectUI } from '@tonconnect/ui-react';
import { getTransactionResponseHash } from './ton';
import { CallTonContract, TonContractCallData } from './tonContractCall';
import {
  readContractByWagmi,
  TReadContractByWagmiParams,
  TWriteContractByWagmiParams,
  waitForTransactionReceiptByWagmi,
  writeContractByWagmi,
} from './wagmi';

export interface AbiType {
  internalType?: string;
  name?: string;
  type?: string;
  components?: AbiType[];
}
type SendOptions = {
  from?: string;
  gasPrice?: string;
  gas?: number;
  value?: number | string;
  nonce?: number;
  onMethod: 'transactionHash' | 'receipt' | 'confirmation';
};
export interface AbiItem {
  constant?: boolean;
  inputs?: AbiType[];
  name?: string;
  outputs?: AbiType[];
  payable?: boolean;
  stateMutability?: string;
  type?: string;
}

export interface ContractProps {
  contractABI?: AbiItem[];
  contractAddress: string;
  chainId?: ChainId;
  aelfContract?: any;
  aelfInstance?: AElfDappBridge;
  viewContract?: any;
  portkeyChain?: IAElfChain;
  tonConnectUI?: TonConnectUI;
}

interface ErrorMsg {
  error: {
    name?: string;
    code: number;
    message: string;
  };
}

type CallViewMethod = (
  functionName: string,
  paramsOption?: any,
  callOptions?: {
    defaultBlock: number | string;
    options?: any;
    callback?: any;
  },
) => Promise<any | ErrorMsg>;

type CallSendMethod = (
  functionName: string,
  account: string,
  paramsOption?: any,
  sendOptions?: SendOptions,
) => Promise<ErrorMsg> | Promise<any>;

export type ContractBasicErrorMsg = ErrorMsg;
export class ContractBasic {
  public address?: string;
  public callContract: WB3ContractBasic | AElfContractBasic | PortkeyContractBasic | TONContractBasic;
  public contractType: ChainType;
  public chainId?: ChainId;
  // public isPortkey?: boolean;
  constructor(options: ContractProps) {
    this.address = options.contractAddress;
    this.chainId = options.chainId;
    const isELF = isELFChain(options.chainId);
    const isTON = isTonChain(options.chainId);
    this.callContract = options.portkeyChain
      ? new PortkeyContractBasic(options)
      : isELF
      ? new AElfContractBasic(options)
      : isTON
      ? new TONContractBasic(options)
      : new WB3ContractBasic(options);
    this.contractType = isELF ? 'ELF' : isTON ? 'TON' : 'ERC';
  }

  public callViewMethod: CallViewMethod = async (
    functionName,
    paramsOption,
    callOptions = { defaultBlock: 'latest' },
  ) => {
    if (this.callContract instanceof AElfContractBasic || this.callContract instanceof PortkeyContractBasic)
      return this.callContract.callViewMethod(functionName, paramsOption);

    return this.callContract.callViewMethod(functionName, paramsOption, callOptions);
  };

  public callSendMethod: CallSendMethod = async (functionName, account, paramsOption, sendOptions) => {
    console.log(functionName, paramsOption, '++++paramsOption');
    if (this.callContract instanceof AElfContractBasic || this.callContract instanceof PortkeyContractBasic)
      return this.callContract.callSendMethod(functionName, paramsOption, sendOptions);
    return this.callContract.callSendMethod(functionName, account, paramsOption, sendOptions);
  };
  public callSendPromiseMethod: CallSendMethod = async (functionName, account, paramsOption, sendOptions) => {
    if (this.callContract instanceof AElfContractBasic || this.callContract instanceof PortkeyContractBasic)
      return this.callContract.callSendPromiseMethod(functionName, paramsOption);

    return this.callContract.callSendPromiseMethod(functionName, account, paramsOption, sendOptions);
  };
  public encodedTx: CallViewMethod = async (functionName, paramsOption) => {
    if (this.callContract instanceof AElfContractBasic) return this.callContract.encodedTx(functionName, paramsOption);
  };
}

export class WB3ContractBasic {
  public address?: string;
  public chainId?: number;
  contractABI: AbiItem[] | undefined;
  constructor(options: ContractProps) {
    const { contractABI, contractAddress, chainId } = options;
    this.contractABI = contractABI;
    this.chainId = chainId as number;
    this.address = contractAddress;
  }

  public callViewMethod: CallViewMethod = async (
    functionName,
    paramsOption,
    callOptions = { defaultBlock: 'latest' },
  ) => {
    try {
      const { defaultBlock } = callOptions;
      const _chainId = this.chainId || ERCChainConstants.chainId;

      const params = {
        abi: this.contractABI,
        functionName,
        address: this.address as string,
        chainId: _chainId,
        args: paramsOption,
      } as TReadContractByWagmiParams;

      if (defaultBlock === 'latest') delete params.blockNumber;

      const res = await readContractByWagmi(params);
      return res;
    } catch (e) {
      console.log(e, '===== WB3ContractBasic callViewMethod');

      return { error: e };
    }
  };

  public callSendMethod: CallSendMethod = async (functionName, account, paramsOption, sendOptions) => {
    try {
      const { onMethod = 'receipt', gas, value, nonce } = sendOptions || {};
      const _chainId = this.chainId || ERCChainConstants.chainId;
      // TODO evm send gasPrice
      // let gasPriceFromApi = sendOptions?.gasPrice;
      // try {
      //   const _gasPrice = (await getGasPriceByWagmi({ chainId: _chainId })) || '10000000000';
      //   gasPriceFromApi = ZERO.plus(Number(_gasPrice)).times(1.15).toFixed(0);
      // } catch (error) {
      //   console.log(error);
      // }

      const params = {
        abi: this.contractABI,
        functionName,
        address: this.address as string,
        chainId: _chainId,
        args: paramsOption,
        account,
      } as TWriteContractByWagmiParams;

      // TODO evm send gasPrice
      // if (gasPriceFromApi) {
      //   params.gasPrice = BigInt(gasPriceFromApi); // parseGwei(gasPriceFromApi);
      // }

      if (gas) {
        params.gas = BigInt(gas);
      }
      if (value) {
        params.value = BigInt(String(value));
      }
      if (nonce) {
        params.nonce = nonce;
      }

      const result = await writeContractByWagmi(params);

      if (onMethod === 'receipt') {
        const receiptResult = await waitForTransactionReceiptByWagmi({ hash: result });
        if (receiptResult.status === 'reverted') {
          throw { message: 'Transaction is reverted', ...receiptResult };
        }

        return { ...receiptResult, TransactionId: receiptResult.transactionHash };
      }

      return { TransactionId: result };
    } catch (error) {
      return { error };
    }
  };

  public callSendPromiseMethod: CallSendMethod = async (functionName, account, paramsOption, sendOptions) => {
    try {
      const _chainId = this.chainId || ERCChainConstants.chainId;
      const params = {
        abi: this.contractABI,
        functionName,
        address: this.address as string,
        chainId: _chainId, // TODO
        args: paramsOption,
        account,
      } as TWriteContractByWagmiParams;

      const { gasPrice, gas, value, nonce } = sendOptions || {};
      if (gasPrice) {
        params.gasPrice = BigInt(gasPrice); // parseGwei(gasPrice);
      }
      if (gas) {
        params.gas = BigInt(gas);
      }
      if (value) {
        params.value = BigInt(String(value));
      }
      if (nonce) {
        params.nonce = nonce;
      }

      return await writeContractByWagmi(params);
    } catch (e) {
      return { error: e };
    }
  };
}

type AElfCallViewMethod = (functionName: string, paramsOption?: any) => Promise<any | ErrorMsg>;

type AElfCallSendMethod = (
  functionName: string,
  paramsOption?: any,
  sendOptions?: SendOptions,
) => Promise<ErrorMsg> | Promise<any>;

export class AElfContractBasic {
  public aelfContract: any;
  public viewContract?: any;
  public address: string;
  public methods?: any;
  public chainId: ChainId;
  public aelfInstance?: AElfDappBridge;
  constructor(options: ContractProps) {
    const { aelfContract, contractAddress, chainId, aelfInstance, viewContract } = options;
    this.address = contractAddress;
    this.aelfContract = aelfContract;
    this.chainId = chainId as ChainId;
    this.aelfInstance = aelfInstance;
    this.viewContract = viewContract;
    this.getFileDescriptorsSet(this.address);
  }
  getFileDescriptorsSet = async (address: string) => {
    try {
      this.methods = await getContractMethods(this.chainId, address);
    } catch (error) {
      throw new Error(JSON.stringify(error) + 'address:' + address + 'Contract:' + 'getContractMethods');
    }
  };
  checkMethods = async () => {
    if (!this.methods) await this.getFileDescriptorsSet(this.address);
  };
  checkConnected = async () => {
    if (!this.aelfInstance) throw Error('aelfInstance is undefined');
    await checkAElfBridge(this.aelfInstance);
  };
  public callViewMethod: AElfCallViewMethod = async (functionName, paramsOption) => {
    const contract = this.viewContract || this.aelfContract;
    if (!contract) return { error: { code: 401, message: 'Contract init error1' } };
    try {
      await this.checkMethods();
      const functionNameUpper = functionName.replace(functionName[0], functionName[0].toLocaleUpperCase());
      const inputType = this.methods[functionNameUpper];

      const req = await contract[functionNameUpper].call(transformArrayToMap(inputType, paramsOption));
      if (!req?.error && (req?.result || req?.result === null)) return req.result;
      return req;
    } catch (e) {
      return { error: e };
    }
  };

  public callSendMethod: AElfCallSendMethod = async (functionName, paramsOption, sendOptions) => {
    if (!this.aelfContract) return { error: { code: 401, message: 'Contract init error2' } };
    try {
      const { onMethod = 'receipt' } = sendOptions || {};
      await this.checkMethods();
      await this.checkConnected();
      const functionNameUpper = functionName.replace(functionName[0], functionName[0].toLocaleUpperCase());
      const inputType = this.methods[functionNameUpper];
      const params = transformArrayToMap(inputType, paramsOption);
      console.log(params, functionNameUpper, '=======params', paramsOption, inputType);
      const req = await this.aelfContract[functionNameUpper](params);
      if (req.error) {
        return {
          error: {
            code: req.error.message?.Code || req.error,
            message: req.errorMessage?.message || req.error.message?.Message,
          },
        };
      }

      const { TransactionId } = req.result || req;
      if (onMethod === 'receipt') {
        await sleep(1000);
        try {
          return await getTxResult(this.chainId, TransactionId);
        } catch (error: any) {
          if (error.message) return { error };
          return {
            ...error,
            error: {
              code: req?.error?.message?.Code || req?.error,
              message: error.Error || req?.errorMessage?.message || req?.error?.message?.Message,
            },
          };
        }
      }
      return { TransactionId };
    } catch (error: any) {
      if (error.message) return { error };
      return { error: { message: error.Error || error.Status } };
    }
  };

  public encodedTx: AElfCallViewMethod = async (functionName, paramsOption) => {
    if (!this.aelfContract) return { error: { code: 401, message: 'Contract init error2' } };
    try {
      await this.checkMethods();
      const methodName = functionName.replace(functionName[0], functionName[0].toLocaleUpperCase());
      const inputType = this.methods[methodName];
      return encodedTransfer({ params: paramsOption, inputType });
    } catch (e) {
      return { error: e };
    }
  };

  public callSendPromiseMethod: AElfCallSendMethod = async (functionName, paramsOption) => {
    if (!this.aelfContract) return { error: { code: 401, message: 'Contract init error3' } };
    if (!ELFChainConstants.aelfInstances?.AELF.appName && !ELFChainConstants.aelfInstances?.AELF.options)
      return { error: { code: 402, message: 'connect aelf' } };
    try {
      await this.checkMethods();
      return this.aelfContract[functionName](transformArrayToMap(this.methods[functionName], paramsOption));
    } catch (e) {
      return { error: e };
    }
  };
}

export class PortkeyContractBasic {
  public contract?: IContract;
  public chainId: ChainId;
  public portkeyChain?: IAElfChain;
  public methods?: any;
  public address: string;
  constructor(options: ContractProps) {
    const { contractAddress, chainId } = options;
    this.portkeyChain = options.portkeyChain;
    this.contract = this.portkeyChain?.getContract(options.contractAddress);
    this.address = contractAddress;
    this.chainId = chainId as ChainId;
    this.getFileDescriptorsSet(this.address);
  }

  getFileDescriptorsSet = async (address: string) => {
    try {
      this.methods = await getContractMethods(this.chainId, address);
    } catch (error) {
      throw new Error(JSON.stringify(error) + 'address:' + address + 'Contract:' + 'getContractMethods');
    }
  };
  checkMethods = async () => {
    if (!this.methods) await this.getFileDescriptorsSet(this.address);
  };
  public callViewMethod: AElfCallViewMethod = async (functionName, paramsOption) => {
    const contract = this.contract;
    if (!contract) return { error: { code: 401, message: 'Contract init error1' } };
    try {
      await this.checkMethods();
      const functionNameUpper = functionName.replace(functionName[0], functionName[0].toLocaleUpperCase());
      const inputType = this.methods[functionNameUpper];

      const req = await contract.callViewMethod(functionNameUpper, transformArrayToMap(inputType, paramsOption));
      console.log(req, transformArrayToMap(inputType, paramsOption), functionNameUpper, '=======callViewMethod');

      if (req.error) return req;

      return req?.data || req;
    } catch (e) {
      return { error: e };
    }
  };

  public callSendMethod: AElfCallSendMethod = async (functionName, paramsOption, sendOptions) => {
    const contract = this.contract;
    if (!contract) return { error: { code: 401, message: 'Contract init error2' } };
    const { onMethod = 'receipt', ...options } = sendOptions || {};
    try {
      await this.checkMethods();
      const functionNameUpper = functionName.replace(functionName[0], functionName[0].toLocaleUpperCase());
      const inputType = this.methods[functionNameUpper];
      console.log(transformArrayToMap(inputType, paramsOption), paramsOption, functionNameUpper, '=callSendMethod');
      const req = await contract.callSendMethod(functionNameUpper, '', transformArrayToMap(inputType, paramsOption), {
        onMethod,
        ...options,
      });
      if (req.error) return req;
      return req?.data || req;
    } catch (error: any) {
      if (error.message) return { error };
      return { error: { message: error.Error || error.Status } };
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public callSendPromiseMethod: CallSendMethod = async (_functionName, _account, _paramsOption, _sendOptions) => {
    throw new Error('Method not implemented.');
  };
}

export class PortkeySDKContractBasic {
  public chainId: ChainId;
  public contractType: string;
  public methods?: any;
  public address: string;
  public sdkContract?: IContract;
  public viewContract: any;
  public portkeyWallet?: WebLoginWalletInfo;
  public caContract?: IContract;

  constructor(
    options: {
      sdkContract?: IContract;
      viewContract: any;
      portkeyWallet?: WebLoginWalletInfo;
      caContract?: IContract;
    } & ContractProps,
  ) {
    const { sdkContract, contractAddress, chainId, viewContract, portkeyWallet, caContract } = options;
    // this.portkeyChain = options.portkeyChain;
    // this.contract = this.portkeyChain?.getContract(options.contractAddress);
    this.address = contractAddress;
    this.sdkContract = sdkContract;
    this.chainId = chainId as ChainId;
    this.viewContract = viewContract;
    this.contractType = 'ELF';
    this.portkeyWallet = portkeyWallet;
    this.caContract = caContract;
  }

  getFileDescriptorsSet = async (address: string) => {
    try {
      this.methods = await getContractMethods(this.chainId, address);
    } catch (error) {
      throw new Error(JSON.stringify(error) + 'address:' + address + 'Contract:' + 'getContractMethods');
    }
  };
  checkMethods = async () => {
    if (!this.methods) await this.getFileDescriptorsSet(this.address);
  };
  public callViewMethod: AElfCallViewMethod = async (functionName, paramsOption) => {
    const contract = this.viewContract;
    if (!contract) return { error: { code: 401, message: 'Contract init error1' } };
    try {
      await this.checkMethods();
      const functionNameUpper = functionName.replace(functionName[0], functionName[0].toLocaleUpperCase());
      const inputType = this.methods[functionNameUpper];

      const req = await contract[functionNameUpper].call(transformArrayToMap(inputType, paramsOption));
      if (!req?.error && (req?.result || req?.result === null)) return req.result;
      return req;
    } catch (e) {
      return { error: e };
    }
  };

  public callSendMethod: CallSendMethod = async (functionName, _account, paramsOption, sendOptions) => {
    const { onMethod = 'receipt', ...options } = sendOptions || {};
    const { TOKEN_CONTRACT } = SupportedELFChain[this.chainId];

    if (this.address === TOKEN_CONTRACT && functionName === 'approve') {
      const contract = this.caContract;
      if (!contract) return { error: { code: 401, message: 'Contract init error2' } };

      const walletInfo = this.portkeyWallet?.extraInfo as ExtraInfoForPortkeyAA;
      const caHash = walletInfo?.portkeyInfo?.caInfo.caHash || '';
      const originChainId = walletInfo?.portkeyInfo?.chainId as any;
      const managerApprove = PortkeyDid.managerApprove;

      const { amount, guardiansApproved } = await managerApprove({
        originChainId,
        targetChainId: this.chainId as any,
        caHash,
        symbol: paramsOption[1],
        amount: paramsOption[2],
        networkType: WEB_LOGIN_CONFIG.portkeyV2.networkType as any,
      });
      const managerApproveProps = {
        caHash,
        spender: paramsOption[0],
        guardiansApproved,
        symbol: paramsOption[1],
        amount,
      };
      const req = await contract.callSendMethod('ManagerApprove', '', managerApproveProps, {
        onMethod,
        ...options,
      });
      if (req.error) return req;
      return req?.data || req;
    }

    const contract = this.sdkContract;
    if (!contract) return { error: { code: 401, message: 'Contract init error2' } };

    try {
      await this.checkMethods();
      const functionNameUpper = functionName.replace(functionName[0], functionName[0].toLocaleUpperCase());
      const inputType = this.methods[functionNameUpper];

      const paramsOptionMap = transformArrayToMap(inputType, paramsOption);

      const req = await contract.callSendMethod(functionNameUpper, '', paramsOptionMap, {
        onMethod,
        ...options,
      });
      if (req.error) return req;
      return req?.data || req;
    } catch (error: any) {
      if (error.message) return { error };
      return { error: { message: error.Error || error.Status } };
    }
  };
}

export class TONContractBasic {
  public tonConnectUI?: TonConnectUI;
  public address?: string;
  public chainId?: number;

  constructor(options: ContractProps) {
    this.tonConnectUI = options.tonConnectUI;
    const { contractAddress, chainId } = options;
    this.chainId = chainId as number;
    this.address = contractAddress;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public callViewMethod: AElfCallViewMethod = async (functionName, paramsOption) => {
    try {
      return (CallTonContract as any)[functionName](this.address, paramsOption);
    } catch (error: any) {
      if (error.message) return { error };
      return { error: { message: error.Error || error.Status } };
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public callSendMethod: CallSendMethod = async (functionName, _account, paramsOption, _sendOptions) => {
    const account = this.tonConnectUI?.account;
    if (!this.address || !account || !this.tonConnectUI)
      return { error: { code: 401, message: 'Contract init error' } };
    try {
      const callData = await (TonContractCallData as any)[functionName](this.address, account.address, paramsOption);
      const result = await this.tonConnectUI?.sendTransaction(callData);
      const hashBase64 = await getTransactionResponseHash(result);
      return { TransactionId: hashBase64 };
    } catch (error: any) {
      if (error.message) return { error };
      return { error: { message: error.Error || error.Status } };
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public callSendPromiseMethod: CallSendMethod = async (_functionName, account, paramsOption, sendOptions) => {};
}
