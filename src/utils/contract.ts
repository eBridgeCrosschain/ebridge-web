import { provider } from 'web3-core';
import type { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
import { ACTIVE_CHAIN, SupportedELFChain, WEB_LOGIN_CONFIG } from '../constants';
import { ELFChainConstants, ERCChainConstants } from 'constants/ChainConstants';
import { getContractMethods, transformArrayToMap, getTxResult, isELFChain, encodedTransfer } from './aelfUtils';
import { ChainId, ChainType } from 'types';
import { getDefaultProvider } from './provider';
import { sleep } from 'utils';
import { AElfDappBridge } from '@aelf-react/types';
import { checkAElfBridge } from './checkAElfBridge';
import { IAElfChain } from '@portkey/provider-types';
import { IContract } from '@portkey/types';
import { PortkeyDidV1, PortkeyDid } from 'aelf-web-login';
import { ILoginWalletContextType } from 'contexts/useLoginWallet/types';
import { ZERO } from 'constants/misc';

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
  provider?: provider;
  contractAddress: string;
  chainId?: ChainId;
  aelfContract?: any;
  aelfInstance?: AElfDappBridge;
  viewContract?: any;
  portkeyChain?: IAElfChain;
}

interface ErrorMsg {
  error: {
    name?: string;
    code: number;
    message: string;
  };
}

type InitContract = (provider: provider, address: string, ABI: AbiItem) => Contract;

type InitViewOnlyContract = (address: string, ABI: AbiItem) => Contract;

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
  public callContract: WB3ContractBasic | AElfContractBasic | PortkeyContractBasic;
  public contractType: ChainType;
  // public isPortkey?: boolean;
  constructor(options: ContractProps) {
    this.address = options.contractAddress;
    const isELF = isELFChain(options.chainId);
    this.callContract = options.portkeyChain
      ? new PortkeyContractBasic(options)
      : isELF
      ? new AElfContractBasic(options)
      : new WB3ContractBasic(options);
    this.contractType = isELF ? 'ELF' : 'ERC';
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
    console.log(paramsOption, '++++paramsOption');
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
  public contract: Contract | null;
  public contractForView: Contract;
  public address?: string;
  public provider?: provider;
  public chainId?: number;
  public web3?: Web3;
  constructor(options: ContractProps) {
    const { contractABI, provider, contractAddress, chainId } = options;
    const contactABITemp = contractABI;

    this.contract =
      contractAddress && provider ? this.initContract(provider, contractAddress, contactABITemp as AbiItem) : null;

    this.contractForView = this.initViewOnlyContract(contractAddress, contactABITemp as AbiItem);
    this.address = contractAddress;
    this.provider = provider;
    this.chainId = chainId as number;
  }

  public initContract: InitContract = (provider, address, ABI) => {
    this.web3 = new Web3(provider);
    return new this.web3.eth.Contract(ABI as any, address);
  };
  public initViewOnlyContract: InitViewOnlyContract = (address, ABI) => {
    const defaultProvider = getDefaultProvider();
    const defaultWeb3 = new Web3(defaultProvider);
    return new defaultWeb3.eth.Contract(ABI as any, address);
  };

  public callViewMethod: CallViewMethod = async (
    functionName,
    paramsOption,
    callOptions = { defaultBlock: 'latest' },
  ) => {
    try {
      const chainId = this.chainId || ERCChainConstants.chainId;
      const { defaultBlock, options } = callOptions;
      let contract = this.contractForView;
      // active chain
      if (ACTIVE_CHAIN[chainId]) contract = this.contract || this.contractForView;
      // BlockTag
      contract.defaultBlock = defaultBlock;

      return await contract.methods[functionName](...(paramsOption || [])).call(options);
    } catch (e) {
      return { error: e };
    }
  };

  public callSendMethod: CallSendMethod = async (functionName, account, paramsOption, sendOptions) => {
    if (!this.contract) return { error: { code: 401, message: 'Contract init error4' } };
    try {
      const contract = this.contract;
      const { onMethod = 'receipt', ...options } = sendOptions || {};

      try {
        const gasPrice = (await this.web3?.eth.getGasPrice()) || '10000000000';
        (options as any).gasPrice = ZERO.plus(gasPrice).times(1.15).toFixed();
      } catch (error) {
        console.log(error);
      }

      const result: any = await new Promise((resolve, reject) =>
        contract.methods[functionName](...(paramsOption || []))
          .send({ from: account, ...options })
          .on(onMethod, resolve)
          .on('error', reject),
      );

      if (onMethod === 'receipt') return { ...result, TransactionId: result.transactionHash };
      return { TransactionId: result };
    } catch (error) {
      return { error };
    }
  };

  public callSendPromiseMethod: CallSendMethod = async (functionName, account, paramsOption, sendOptions) => {
    if (!this.contract) return { error: { code: 401, message: 'Contract init error5' } };
    try {
      const contract = this.contract;

      return contract.methods[functionName](...(paramsOption || [])).send({
        from: account,
        ...sendOptions,
      });
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
      console.log(transformArrayToMap(inputType, paramsOption), '=Option');
      const req = await this.aelfContract[functionNameUpper](transformArrayToMap(inputType, paramsOption));
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
  public provider?: provider;
  public chainId: ChainId;
  public portkeyChain?: IAElfChain;
  public methods?: any;
  public address: string;
  constructor(options: ContractProps) {
    const { provider, contractAddress, chainId } = options;
    this.portkeyChain = options.portkeyChain;
    this.contract = this.portkeyChain?.getContract(options.contractAddress);
    this.address = contractAddress;
    this.provider = provider;
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
  public callSendPromiseMethod: CallSendMethod = async (functionName, account, paramsOption, sendOptions) => {
    throw new Error('Method not implemented.');
  };
}

export class PortkeySDKContractBasic {
  // public contract?: IContract;
  // public provider?: provider;
  public chainId: ChainId;
  // public portkeyChain?: IAElfChain;
  public contractType: string;
  public methods?: any;
  public address: string;
  public sdkContract?: IContract;
  public viewContract: any;
  public portkeyWallet?: ILoginWalletContextType;
  public caContract?: IContract;

  constructor(
    options: {
      sdkContract?: IContract;
      viewContract: any;
      portkeyWallet?: ILoginWalletContextType;
      caContract?: IContract;
    } & ContractProps,
  ) {
    const { sdkContract, contractAddress, chainId, viewContract, portkeyWallet, caContract } = options;
    // this.portkeyChain = options.portkeyChain;
    // this.contract = this.portkeyChain?.getContract(options.contractAddress);
    this.address = contractAddress;
    // this.provider = provider;
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

      const caHash = this.portkeyWallet?.wallet?.portkeyInfo?.caInfo.caHash || '';
      const originChainId = this.portkeyWallet?.wallet?.portkeyInfo?.chainId as any;
      const managerApprove =
        this.portkeyWallet?.version === 'v1' ? PortkeyDidV1.managerApprove : PortkeyDid.managerApprove;

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
