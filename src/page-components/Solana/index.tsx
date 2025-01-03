import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import React, { FC, useCallback } from 'react';
import {
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
  Keypair,
  Connection,
} from '@solana/web3.js';
import {
  createMint,
  createAccount,
  TOKEN_2022_PROGRAM_ID,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMint,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
} from '@solana/spl-token';
import CommonButton from 'components/CommonButton';
import { sleep } from 'utils';
import { createSolToken } from './utils';
const SendSOLToRandomAddress: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const wallet = useAnchorWallet();
  // payer
  const onClick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    // 890880 lamports as of 2022-09-01
    const lamports = await connection.getMinimumBalanceForRentExemption(0);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: Keypair.generate().publicKey,
        lamports,
      }),
    );

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    const signature = await sendTransaction(transaction, connection, { minContextSlot });

    await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
  }, [publicKey, sendTransaction, connection]);

  const createToken = useCallback(async () => {
    try {
      if (!publicKey || !wallet) return;
      // const payer = (wallet as any).payer;
      const feePayer = Keypair.generate();
      const lamports = (await getMinimumBalanceForRentExemptMint(connection)) * 5; //here added some extra for gas fee
      // const transaction
      const sign1 = await sendTransaction(
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: feePayer.publicKey,
            lamports,
          }),
        ),
        connection,
      );
      const latestBlockHash = await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        ...latestBlockHash,
        signature: sign1,
      });
      await createSolToken({
        account: publicKey,
        payer: feePayer,
        tokenInfo: {
          symbol: 'TEST',
          name: 'TEST name',
          decimals: 10,
          imageUri: 'https://gpt.aelf.ai/static/favicon.png',
        },
      });
    } catch (error) {
      console.log(error, '=====error');
    }
  }, [connection, publicKey, sendTransaction, wallet]);

  return (
    <CommonButton onClick={createToken} disabled={!publicKey}>
      Send SOL to a random address!
    </CommonButton>
  );
};

export default SendSOLToRandomAddress;
