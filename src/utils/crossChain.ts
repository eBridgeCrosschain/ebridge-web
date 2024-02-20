import { SupportedELFChainId } from 'constants/chain';
import { ChainId, TokenInfo } from 'types';
import { CrossChainItem } from 'types/api';
import { encodeTransaction, getAElf, uint8ArrayToHex } from './aelfUtils';
import { base58ToChainId, getChainIdToMap } from './chain';
import type { ContractBasic } from './contract';
import AElf from 'aelf-sdk';
import { AElfTransaction, TransactionResult } from '@aelf-react/types';
import { checkApprove } from 'contracts';
import type { provider } from 'web3-core';
import { CrossFeeToken, REQ_CODE, ZERO } from 'constants/misc';
import { isChainSupportedByTRC } from 'utils/common';
import { getTokenInfoByWhitelist } from './whitelist';
import { timesDecimals } from './calculate';
import { formatAddress, isIncludesChainId } from 'utils';
import { FormatTokenList } from 'constants/index';
import { LimitDataProps } from 'page-components/Home/useLimitAmountModal/constants';
import BigNumber from 'bignumber.js';
import CommonMessage from 'components/CommonMessage';
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
  library,
  fromToken,
  account,
  bridgeContract,
  amount,
  toChainId,
  to,
  tokenContract,
  fromChainId,
  trcLibrary,
  crossFee,
}: {
  bridgeContract: ContractBasic;
  library: provider;
  fromToken: string;
  account: string;
  amount: string;
  toChainId: ChainId;
  to: string;
  tokenContract: ContractBasic;
  fromChainId: ChainId;
  trcLibrary: provider;
  crossFee?: string;
}) {
  const toAddress = formatAddress(to);
  const fromELFChain = bridgeContract.contractType === 'ELF';
  if (fromELFChain && fromToken !== CrossFeeToken) {
    const req = await checkApprove(
      library,
      trcLibrary,
      CrossFeeToken,
      account,
      bridgeContract.address || '',
      fromChainId,
      timesDecimals(crossFee, 8).toFixed(0),
      undefined,
      fromELFChain ? tokenContract : undefined,
    );
    if (req !== REQ_CODE.Success) throw req;
  }
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
    library,
    trcLibrary,
    fromToken,
    account,
    bridgeContract.address || '',
    fromChainId,
    checkAmount,
    undefined,
    fromELFChain ? tokenContract : undefined,
  );
  if (req !== REQ_CODE.Success) throw req;
  if (fromELFChain) {
    return bridgeContract.callSendMethod('createReceipt', account, [
      fromToken,
      account,
      toAddress,
      amount,
      getChainIdToMap(toChainId),
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
  library: provider;
  fromToken: string;
  account: string;
  amount: string;
  toChainId: ChainId;
  to: string;
  tokenContract?: ContractBasic;
}) {
  const toAddress = formatAddress(to);
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
    swapId = await bridgeOutContract?.callViewMethod('GetSwapIdByToken', [chainId, toSymbol]);
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
  } else if (isChainSupportedByTRC(toChainId)) {
    swapId = await bridgeOutContract?.callViewMethod('getSwapId', [address, chainId]);
  } else {
    swapId = await bridgeOutContract?.callViewMethod('getSwapId', [address, chainId]);
  }

  return swapId;
}

export async function getReceiptLimit({
  limitContract,
  toChainId,
  fromChainId,
  symbol,
}: {
  limitContract?: ContractBasic;
  toChainId?: ChainId;
  fromChainId?: ChainId;
  symbol?: string;
}): Promise<LimitDataProps | undefined> {
  if (!limitContract || !toChainId || !fromChainId || !symbol) {
    return;
  }

  const { address } = getTokenInfoByWhitelist(fromChainId, symbol) || {};
  try {
    const [receiptDailyLimit, receiptTokenBucket] = await Promise.all([
      limitContract?.callViewMethod('getReceiptDailyLimit', [address, getChainIdToMap(toChainId)]),
      limitContract?.callViewMethod('getCurrentReceiptTokenBucketState', [address, getChainIdToMap(toChainId)]),
    ]);

    if (receiptDailyLimit.error || receiptTokenBucket.error) {
      throw new Error(receiptDailyLimit.error || receiptTokenBucket.error);
    }

    return {
      remain: new BigNumber(receiptDailyLimit.tokenAmount),
      maxCapcity: new BigNumber(receiptTokenBucket.tokenCapacity),
      currentCapcity: new BigNumber(receiptTokenBucket.currentTokenAmount),
      fillRate: new BigNumber(receiptTokenBucket.rate),
      isEnable: receiptTokenBucket.isEnabled,
    };
  } catch (error: any) {
    CommonMessage.error(error.message);
  }
}

export async function getSwapLimit({
  limitContract,
  fromChainId,
  swapId,
  toChainId,
  symbol,
}: {
  limitContract?: ContractBasic;
  fromChainId?: ChainId;
  toChainId?: ChainId;
  swapId?: string;
  symbol?: string;
}): Promise<LimitDataProps | undefined> {
  if (!limitContract || !toChainId || !symbol || !fromChainId || !swapId) {
    return;
  }

  const { address } = getTokenInfoByWhitelist(toChainId, symbol) || {};
  try {
    const [swapDailyLimit, swapTokenBucket] = await Promise.all([
      limitContract?.callViewMethod('getSwapDailyLimit', [swapId]),
      limitContract?.callViewMethod('getCurrentSwapTokenBucketState', [address, getChainIdToMap(fromChainId)]),
    ]);

    if (swapDailyLimit.error || swapTokenBucket.error) {
      throw new Error(swapDailyLimit.error || swapTokenBucket.error);
    }

    return {
      remain: new BigNumber(swapDailyLimit.tokenAmount),
      maxCapcity: new BigNumber(swapTokenBucket.tokenCapacity),
      currentCapcity: new BigNumber(swapTokenBucket.currentTokenAmount),
      fillRate: new BigNumber(swapTokenBucket.rate),
      isEnable: swapTokenBucket.isEnabled,
    };
  } catch (error: any) {
    CommonMessage.error(error.message);
  }
}
