import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { ZERO } from 'constants/misc';
import { timesDecimals } from 'utils/calculate';
import { configureAndSendCurrentTransaction } from './solana';
import { WalletContextState } from '@solana/wallet-adapter-react';

export class SendSolanaContract {
  static async createReceipt(
    contractAddress: string,
    account: string,
    paramsOption: any[],
    connection: Connection,
    signTransaction: WalletContextState['signTransaction'],
  ) {
    const toAccount = paramsOption[0];
    const amount = paramsOption[1];
    const decimals = paramsOption[2];

    if (!signTransaction || !account || !toAccount) return '';

    const fromPublicKey = new PublicKey(account); // TODO solana check
    const toPublicKey = new PublicKey(toAccount);
    const tokenContractPublicKey = new PublicKey(contractAddress);

    const transactionInstructions: TransactionInstruction[] = [];
    const senderTokenAccount = await getAssociatedTokenAddress(
      tokenContractPublicKey,
      fromPublicKey,
      // false,
      // TOKEN_PROGRAM_ID,
    );

    const associatedTokenTo = await getAssociatedTokenAddress(tokenContractPublicKey, toPublicKey);
    console.log('>>>>>> SOL associatedTokenTo', associatedTokenTo);
    if (!(await connection.getAccountInfo(associatedTokenTo))) {
      transactionInstructions.push(
        createAssociatedTokenAccountInstruction(fromPublicKey, associatedTokenTo, toPublicKey, tokenContractPublicKey),
      );
    }

    const fromAccount = await getAccount(connection, senderTokenAccount);
    console.log('>>>>>> SOL fromAccount', fromAccount);
    const amountFormat = timesDecimals(ZERO.plus(amount), decimals).toNumber();
    transactionInstructions.push(
      createTransferInstruction(
        fromAccount.address, // source
        associatedTokenTo, // destination
        fromPublicKey,
        amountFormat, // amount
      ),
    );
    const transaction = new Transaction().add(...transactionInstructions);
    const signature = await configureAndSendCurrentTransaction(transaction, connection, fromPublicKey, signTransaction);
    return signature;
  }
}

export class ViewSolanaContract {}
