import { useCallback, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { configureAndSendCurrentTransaction } from 'utils/wallet/solana';
import {
  IGetSolanaBalanceRequest,
  IGetSolanaBalanceResult,
  SendSolanaTransactionParams,
  WalletTypeEnum,
} from 'types/wallet';
import { SOLANA_STORAGE_CONNECTED_KEY } from 'constants/wallets';
import { devices } from '@portkey/utils';
import { sleep } from 'utils';
import { timesDecimals } from 'utils/calculate';
import { ZERO } from 'constants/misc';
import { SolanaConnectorId } from 'types';

export default function useSolana() {
  const { connection } = useConnection();
  const { publicKey, connected, disconnect, select, signTransaction, wallets } = useWallet();

  const onConnect = useCallback(
    async (walletName: string) => {
      const _wallet = wallets.find((item) => item.adapter.name === walletName);
      if (!_wallet) return;
      select(_wallet.adapter.name);

      const isMobile = devices.isMobileDevices();
      if (isMobile) {
        await sleep(3000);
        // await disconnect();
        localStorage?.removeItem(SOLANA_STORAGE_CONNECTED_KEY);
        window.location.reload();
      }
    },
    [select, wallets],
  );

  const onGetBalance = useCallback(
    async ({ tokenContractAddress }: IGetSolanaBalanceRequest): Promise<IGetSolanaBalanceResult> => {
      if (!publicKey) return { value: '0' };
      const tokenAddress = new PublicKey(tokenContractAddress);
      const senderTokenAccount = await getAssociatedTokenAddress(tokenAddress, publicKey, false, TOKEN_PROGRAM_ID);
      const { value } = await connection.getTokenAccountBalance(senderTokenAccount);
      return {
        value: value.amount,
        decimals: value.decimals,
      };
    },
    [connection, publicKey],
  );

  const sendTransaction = useCallback(
    async ({ tokenContractAddress, toAddress, amount, decimals }: SendSolanaTransactionParams) => {
      if (!signTransaction || !publicKey) return '';

      const toPublicKey = new PublicKey(toAddress);
      const tokenContractPublicKey = new PublicKey(tokenContractAddress);

      const transactionInstructions: TransactionInstruction[] = [];
      const senderTokenAccount = await getAssociatedTokenAddress(
        tokenContractPublicKey,
        publicKey,
        // false,
        // TOKEN_PROGRAM_ID,
      );
      const fromAccount = await getAccount(connection, senderTokenAccount);
      console.log('>>>>>> SOL fromAccount', fromAccount);
      const associatedTokenTo = await getAssociatedTokenAddress(tokenContractPublicKey, toPublicKey);
      console.log('>>>>>> SOL associatedTokenTo', associatedTokenTo);
      if (!(await connection.getAccountInfo(associatedTokenTo))) {
        transactionInstructions.push(
          createAssociatedTokenAccountInstruction(publicKey, associatedTokenTo, toPublicKey, tokenContractPublicKey),
        );
      }
      const amountFormat = timesDecimals(ZERO.plus(amount), decimals).toNumber();
      transactionInstructions.push(
        createTransferInstruction(
          fromAccount.address, // source
          associatedTokenTo, // destination
          publicKey,
          amountFormat, // amount
        ),
      );
      const transaction = new Transaction().add(...transactionInstructions);
      const signature = await configureAndSendCurrentTransaction(transaction, connection, publicKey, signTransaction);
      return signature;
    },
    [connection, publicKey, signTransaction],
  );

  const solanaContext = useMemo(() => {
    return {
      // chainId:'', // TODO solana
      account: publicKey?.toString(),
      accounts: publicKey?.toString() ? [publicKey?.toString()] : [],
      baseAccount: publicKey,
      isActive: connected,
      loginWalletType: undefined,
      walletType: WalletTypeEnum.SOL,
      connector: WalletTypeEnum.SOL, // wallet?.adapter,
      connectorId: SolanaConnectorId.Phantom,
      connect: onConnect,
      disconnect: disconnect,
      getAccountInfo: connection.getAccountInfo,
      getBalance: onGetBalance,
      sendTransaction,
    };
  }, [connected, connection.getAccountInfo, disconnect, onConnect, onGetBalance, publicKey, sendTransaction]);

  return solanaContext;
}
