import { SupportedELFChainId } from 'constants/chain';
import { ChainId, TokenInfo } from 'types';
import { CrossChainItem } from 'types/api';
import { encodeTransaction, getAElf, uint8ArrayToHex } from './aelfUtils';
import { base58ToChainId, getChainIdToMap } from './chain';
import type { ContractBasic } from './contract';
import AElf from 'aelf-sdk';
import { AElfTransaction, TransactionResult } from '@aelf-react/types';
import { checkApprove } from 'contracts';
import { CrossFeeToken, REQ_CODE, ZERO } from 'constants/misc';
import { getTokenInfoByWhitelist } from './whitelist';
import { timesDecimals } from './calculate';
import { formatAddress, isIncludesChainId, isTonChain } from 'utils';
import { FormatTokenList } from 'constants/index';
import { LimitDataProps } from 'page-components/Bridge/useLimitAmountModal/constants';
import BigNumber from 'bignumber.js';
import CommonMessage from 'components/CommonMessage';
import { handleErrorMessage } from './error';
export async function CrossChainTransfer({
  contract,
  account,
  to,
  token,
  toChainId,
  amount,
}: {
  contract: ContractBasic;
  account: string;
  to: string;
  token: TokenInfo;
  toChainId: ChainId;
  amount: string;
}) {
  console.log('CrossChainTransfer', '===CrossChainTransfer');

  return contract.callSendMethod(
    'CrossChainTransfer',
    account,
    [to, token.symbol, amount, ' ', base58ToChainId(toChainId), token.issueChainId],
    { onMethod: 'receipt' },
  );
}

async function getMerklePath(sendInstance: any, transferTransactionId?: string | null) {
  const merklePathByTxId = await sendInstance.chain.getMerklePathByTxId(transferTransactionId);
  const merklePath = {
    merklePathNodes: [...merklePathByTxId.MerklePathNodes],
  };
  merklePath.merklePathNodes = merklePath.merklePathNodes.map((item) => ({
    hash: {
      value: Buffer.from(item.Hash, 'hex').toString('base64'),
    },
    isLeftChildNode: item.IsLeftChildNode,
  }));
  return {
    merklePath,
  };
}
async function getBoundParentChainHeightAndMerklePathByHeight(
  sendCrossChainContract: ContractBasic,
  crossTransferTxBlockHeight?: number | null,
) {
  const req = await sendCrossChainContract.callViewMethod('GetBoundParentChainHeightAndMerklePathByHeight', [
    crossTransferTxBlockHeight,
  ]);
  const { merklePathFromParentChain, boundParentChainHeight } = req;

  merklePathFromParentChain.merklePathNodes = merklePathFromParentChain.merklePathNodes.map((item: any) => ({
    hash: {
      value: Buffer.from(item.hash, 'hex').toString('base64'),
    },
    isLeftChildNode: item.isLeftChildNode,
  }));
  return {
    merklePathFromParentChain,
    boundParentChainHeight,
  };
}

async function signTransaction({
  Transaction,
  sendTokenContract,
}: {
  Transaction: AElfTransaction;
  sendTokenContract: ContractBasic;
}): Promise<string> {
  const { Params, From, To, MethodName, RefBlockNumber, RefBlockPrefix, Signature } = Transaction;
  const encoded = await sendTokenContract.encodedTx(MethodName, JSON.parse(Params));
  const raw = AElf.pbUtils.getTransaction(From, To, MethodName, encoded);
  raw.refBlockNumber = RefBlockNumber;
  raw.refBlockPrefix = Uint8Array.from(Buffer.from(RefBlockPrefix, 'base64'));
  //   raw.signature = await getSignatureByBridge(
  //     ELFChainConstants.aelfInstances?.AELF,
  //     '2BC7WWMNBp4LjmJ48VAfDocEU2Rjg5yhELxT2HewfYxPPrdxA9',
  //     Buffer.from(encodeTransaction(raw)).toString('hex'),
  //   );

  raw.signature = Buffer.from(Signature, 'base64').toString('hex');

  let tx = encodeTransaction(raw);
  if (tx instanceof Buffer) {
    tx = tx.toString('hex');
  } else {
    tx = uint8ArrayToHex(tx);
  }
  return tx;
}

export async function CrossChainReceive({
  sendChainID,
  receiveItem,
  sendCrossChainContract,
  sendTokenContract,
  receiveTokenContract,
}: {
  sendChainID: ChainId;
  receiveItem: CrossChainItem;
  sendCrossChainContract: ContractBasic;
  sendTokenContract: ContractBasic;
  receiveTokenContract: ContractBasic;
}) {
  const { transferTransactionId, fromChainId } = receiveItem;
  const sendInstance = getAElf(sendChainID);
  const crossTransferTxInfo: TransactionResult = await sendInstance.chain.getTxResult(transferTransactionId);
  const { BlockNumber, Transaction } = crossTransferTxInfo;

  const { merklePath } = await getMerklePath(sendInstance, transferTransactionId);
  let parentChainHeight = BlockNumber;
  if (sendChainID !== SupportedELFChainId.AELF) {
    const { merklePathFromParentChain, boundParentChainHeight } = await getBoundParentChainHeightAndMerklePathByHeight(
      sendCrossChainContract,
      BlockNumber,
    );
    parentChainHeight = boundParentChainHeight;
    merklePath.merklePathNodes = [...merklePath.merklePathNodes, ...merklePathFromParentChain.merklePathNodes];
  }
  const tx = await signTransaction({
    Transaction,
    sendTokenContract,
  });

  return receiveTokenContract.callSendMethod('CrossChainReceiveToken', '', {
    fromChainId: base58ToChainId(fromChainId as any),
    parentChainHeight,
    transferTransactionBytes: Buffer.from(tx, 'hex').toString('base64'),
    merklePath,
  });
}
export function ValidateTokenInfoExists({
  contract,
  tokenInfo,
  account,
}: {
  contract: ContractBasic;
  tokenInfo: TokenInfo;
  account: string;
}) {
  return contract.callSendMethod('ValidateTokenInfoExists', account, tokenInfo);
}

export async function CrossChainCreateToken({
  sendChainID,
  transactionId,
  sendCrossChainContract,
  sendTokenContract,
  receiveTokenContract,
}: {
  sendChainID: ChainId;
  transactionId: string;
  sendCrossChainContract: ContractBasic;
  sendTokenContract: ContractBasic;
  receiveTokenContract: ContractBasic;
}) {
  const sendInstance = getAElf(sendChainID);
  const txInfo: TransactionResult = await sendInstance.chain.getTxResult(transactionId);
  const { BlockNumber, Transaction } = txInfo;

  const { merklePath } = await getMerklePath(sendInstance, transactionId);
  let parentChainHeight = BlockNumber;

  if (sendChainID !== SupportedELFChainId.AELF) {
    const { merklePathFromParentChain, boundParentChainHeight } = await getBoundParentChainHeightAndMerklePathByHeight(
      sendCrossChainContract,
      BlockNumber,
    );
    parentChainHeight = boundParentChainHeight;
    merklePath.merklePathNodes = [...merklePath.merklePathNodes, ...merklePathFromParentChain.merklePathNodes];
  }
  const tx = await signTransaction({
    Transaction,
    sendTokenContract,
  });

  return receiveTokenContract.callSendMethod('CrossChainCreateToken', '', {
    fromChainId: base58ToChainId(sendChainID as any),
    parentChainHeight,
    transactionBytes: Buffer.from(tx, 'hex').toString('base64'),
    merklePath,
  });
}

export async function CreateReceipt({
  fromToken,
  account,
  bridgeContract,
  amount,
  fromChainId,
  toChainId,
  to,
  tokenContract,
  crossFee,
}: {
  bridgeContract: ContractBasic;
  fromToken: string;
  account: string;
  amount: string;
  fromChainId: ChainId;
  toChainId: ChainId;
  to: string;
  tokenContract: ContractBasic;
  crossFee?: string;
}) {
  let toAddress = to;
  if (bridgeContract.contractType !== 'ELF') toAddress = formatAddress(to);
  if (bridgeContract.contractType === 'ERC')
    toAddress = '0x' + Buffer.from(AElf.utils.base58.decode(toAddress)).toString('hex');
  const fromTonChain = bridgeContract.contractType === 'TON';
  const fromELFChain = bridgeContract.contractType === 'ELF';
  if (fromELFChain && fromToken !== CrossFeeToken) {
    const req = await checkApprove(
      fromChainId,
      CrossFeeToken,
      account,
      bridgeContract.address || '',
      timesDecimals(crossFee, 8).toFixed(0),
      undefined,
      fromELFChain ? tokenContract : undefined,
    );
    if (req !== REQ_CODE.Success) throw req;
  }
  if (!fromTonChain) {
    let checkAmount = amount;
    if (fromToken === CrossFeeToken) {
      if (crossFee) {
        // fee ELF decimals 8
        crossFee = timesDecimals(crossFee, 8).toFixed(0);
      }
      checkAmount = ZERO.plus(amount)
        .plus(crossFee || 0)
        .toFixed(0);
    }
    const req = await checkApprove(
      fromChainId,
      fromToken,
      account,
      bridgeContract.address || '',
      checkAmount,
      undefined,
      fromELFChain ? tokenContract : undefined,
    );
    if (req !== REQ_CODE.Success) throw req;
  }
  console.log(
    fromELFChain,
    toChainId,
    [fromToken, account, toAddress, amount, getChainIdToMap(toChainId), isTonChain(toChainId) ? 1 : 0],
    '======toChainId',
  );
  if (fromELFChain) {
    return bridgeContract.callSendMethod('createReceipt', account, [
      fromToken,
      account,
      toAddress,
      amount,
      getChainIdToMap(toChainId),
      isTonChain(toChainId) ? 1 : 0,
    ]);
  }
  return bridgeContract.callSendMethod(
    'createReceipt',
    account,
    [fromToken, amount, getChainIdToMap(toChainId), toAddress],
    {
      onMethod: 'transactionHash',
    },
  );
}

export async function LockToken({
  account,
  bridgeContract,
  amount,
  toChainId,
  to,
}: {
  bridgeContract: ContractBasic;
  account: string;
  amount: string;
  toChainId: ChainId;
  to: string;
}) {
  const toAddress = '0x' + Buffer.from(AElf.utils.base58.decode(formatAddress(to))).toString('hex');
  return bridgeContract.callSendMethod('createNativeTokenReceipt', account, [getChainIdToMap(toChainId), toAddress], {
    onMethod: 'transactionHash',
    value: amount,
  });
}

export async function SwapToken({
  bridgeOutContract,
  toAccount,
  receiveItem,
}: {
  receiveItem: CrossChainItem;
  bridgeOutContract: ContractBasic;
  toAccount: string;
}) {
  const { transferAmount, receiptId, toAddress, transferToken, toChainId, fromChainId } = receiveItem || {};
  if (!(toChainId && transferToken?.symbol)) return;
  let toSymbol = transferToken.symbol;
  const item = FormatTokenList.find(
    (i) =>
      i.fromSymbol === transferToken.symbol &&
      isIncludesChainId(i.fromChainId, fromChainId) &&
      isIncludesChainId(i.toChainId, toChainId),
  );
  if (item) toSymbol = item.toSymbol;

  const { address } = getTokenInfoByWhitelist(toChainId, toSymbol) || {};
  const originAmount = timesDecimals(transferAmount, transferToken.decimals).toFixed();
  const chainId = getChainIdToMap(fromChainId);

  let swapId;
  if (bridgeOutContract.contractType === 'ELF') {
    swapId = await bridgeOutContract?.callViewMethod('GetSwapIdByToken', [
      chainId,
      getTokenInfoByWhitelist(toChainId, toSymbol)?.symbol,
    ]);
  } else {
    swapId = await bridgeOutContract?.callViewMethod('getSwapId', [address, chainId]);
  }

  if (swapId.error) return swapId;

  return bridgeOutContract?.callSendMethod('swapToken', toAccount, [swapId, receiptId, originAmount, toAddress]);
}

export async function getSwapId({
  bridgeOutContract,
  toChainId,
  fromChainId,
  symbol,
}: {
  bridgeOutContract?: ContractBasic;
  toChainId?: ChainId;
  fromChainId?: ChainId;
  symbol?: string;
}) {
  if (!bridgeOutContract || !toChainId || !fromChainId || !symbol) {
    return;
  }

  let swapId;
  const { address } = getTokenInfoByWhitelist(toChainId, symbol) || {};
  const chainId = getChainIdToMap(fromChainId);

  if (bridgeOutContract?.contractType === 'ELF') {
    swapId = await bridgeOutContract?.callViewMethod('GetSwapIdByToken', [chainId, symbol]);
  } else {
    swapId = await bridgeOutContract?.callViewMethod('getSwapId', [address, chainId]);
  }

  return swapId;
}

export async function getReceiptLimit({
  limitContract,
  toChainId,
  fromChainId,
  fromSymbol,
}: {
  limitContract?: ContractBasic;
  toChainId?: ChainId;
  fromChainId?: ChainId;
  fromSymbol?: string;
}): Promise<LimitDataProps | undefined> {
  if (!limitContract || !toChainId || !fromChainId || !fromSymbol) {
    return;
  }

  const { address } = getTokenInfoByWhitelist(fromChainId, fromSymbol) || {};
  try {
    const [receiptDailyLimit, receiptTokenBucket] = await Promise.all([
      limitContract?.callViewMethod('getReceiptDailyLimit', [address, getChainIdToMap(toChainId)]),
      limitContract?.callViewMethod('getCurrentReceiptTokenBucketState', [address, getChainIdToMap(toChainId)]),
    ]);

    if (receiptDailyLimit.error || receiptTokenBucket.error) {
      throw receiptDailyLimit.error || receiptTokenBucket.error;
    }

    const isEnable = receiptTokenBucket.isEnable;

    return {
      remain: new BigNumber(receiptDailyLimit.tokenAmount),
      maxCapcity: new BigNumber(receiptTokenBucket.tokenCapacity),
      currentCapcity: new BigNumber(receiptTokenBucket.currentTokenAmount),
      fillRate: new BigNumber(receiptTokenBucket.rate),
      isEnable,
    };
  } catch (error: any) {
    CommonMessage.error(handleErrorMessage(error));
    console.log('getReceiptLimit error :', error);
  }
}

export async function getSwapLimit({
  limitContract,
  fromChainId,
  swapId,
  toChainId,
  toSymbol,
}: {
  limitContract?: ContractBasic;
  fromChainId?: ChainId;
  toChainId?: ChainId;
  swapId?: string;
  toSymbol?: string;
}): Promise<LimitDataProps | undefined> {
  if (!limitContract || !toChainId || !toSymbol || !fromChainId || !swapId) {
    return;
  }

  const { address } = getTokenInfoByWhitelist(toChainId, toSymbol) || {};
  try {
    const [swapDailyLimit, swapTokenBucket] = await Promise.all([
      limitContract?.callViewMethod('getSwapDailyLimit', [swapId]),
      limitContract?.callViewMethod('getCurrentSwapTokenBucketState', [address, getChainIdToMap(fromChainId)]),
    ]);

    if (swapDailyLimit.error || swapTokenBucket.error) {
      throw swapDailyLimit.error || swapTokenBucket.error;
    }

    return {
      remain: new BigNumber(swapDailyLimit.tokenAmount),
      maxCapcity: new BigNumber(swapTokenBucket.tokenCapacity),
      currentCapcity: new BigNumber(swapTokenBucket.currentTokenAmount),
      fillRate: new BigNumber(swapTokenBucket.rate),
      isEnable: swapTokenBucket.isEnabled,
    };
  } catch (error: any) {
    CommonMessage.error(handleErrorMessage(error));
    console.log('getSwapLimit error :', error);
  }
}
