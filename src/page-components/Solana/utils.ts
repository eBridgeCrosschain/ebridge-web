import {
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  ExtensionType,
  getAssociatedTokenAddress,
  getMetadataPointerState,
  getMint,
  getMintLen,
  getTokenMetadata,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from '@solana/spl-token';
import {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  pack,
  TokenMetadata,
} from '@solana/spl-token-metadata';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { timesDecimals } from 'utils/calculate';

export async function createSolToken({
  account,
  tokenInfo,
  payer,
}: {
  payer: Keypair;
  account: PublicKey;
  tokenInfo: { name: string; symbol: string; imageUri: string; decimals: number };
}) {
  const authority = payer.publicKey;
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // const payer = Keypair.generate();

  const mintKeypair = Keypair.generate();

  const mint = mintKeypair.publicKey;
  const metaData: TokenMetadata = {
    updateAuthority: authority,
    mint: mint,
    name: tokenInfo.name,
    symbol: tokenInfo.symbol,
    uri: tokenInfo.imageUri,
    additionalMetadata: [
      ['namea', 'aaa'],
      ['ccc', 'ddd'],
    ],
  };
  const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
  const metadataLen = pack(metaData).length;
  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  // Minimum lamports required for Mint Account
  const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataExtension + metadataLen);

  // Instruction to invoke System Program to create new account
  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey, // Account that will transfer lamports to created account
    newAccountPubkey: mint, // Address of the account to create
    space: mintLen, // Amount of bytes to allocate to the created account
    lamports, // Amount of lamports transferred to created account
    programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
  });
  // Instruction to initialize the MetadataPointer Extension
  const initializeMetadataPointerInstruction = createInitializeMetadataPointerInstruction(
    mint, // Mint Account address
    authority, // Authority that can set the metadata address
    mint, // Account address that holds the metadata
    TOKEN_2022_PROGRAM_ID,
  );
  // Instruction to initialize Mint Account data
  const initializeMintInstruction = createInitializeMintInstruction(
    mint, // Mint Account Address
    tokenInfo.decimals, // Decimals of Mint
    authority, // Designated Mint Authority
    null, // Optional Freeze Authority
    TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
  );
  // Instruction to initialize Metadata Account data
  const initializeMetadataInstruction = createInitializeInstruction({
    programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
    metadata: mint, // Account address that holds the metadata
    updateAuthority: authority, // Authority that can update the metadata
    mint: mint, // Mint Account address
    mintAuthority: authority, // Designated Mint Authority
    name: metaData.name,
    symbol: metaData.symbol,
    uri: metaData.uri,
  });
  // Instruction to update metadata, adding custom field
  const updateFieldInstruction = createUpdateFieldInstruction({
    programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
    metadata: mint, // Account address that holds the metadata
    updateAuthority: authority, // Authority that can update the metadata
    field: metaData.additionalMetadata[0][0], // key
    value: metaData.additionalMetadata[0][1], // value
  });

  const updateFieldInstruction1 = createUpdateFieldInstruction({
    programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
    metadata: mint, // Account address that holds the metadata
    updateAuthority: authority, // Authority that can update the metadata
    field: metaData.additionalMetadata[1][0], // key
    value: metaData.additionalMetadata[1][1], // value
  });

  const transaction = new Transaction().add(
    createAccountInstruction,
    initializeMetadataPointerInstruction,
    initializeMintInstruction,
    initializeMetadataInstruction,
    updateFieldInstruction,
    updateFieldInstruction1,
  );

  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, mintKeypair], // Signers
  );
  console.log('\nCreate Mint Account:', `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`);

  // Retrieve mint information
  const mintInfo = await getMint(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
  // Retrieve and log the metadata pointer state
  const metadataPointer = getMetadataPointerState(mintInfo);
  console.log('\nMetadata Pointer:', JSON.stringify(metadataPointer, null, 2));
  // Retrieve and log the metadata state
  const metadata = await getTokenMetadata(
    connection,
    mint, // Mint Account address
  );
  console.log('\nMetadata:', JSON.stringify(metadata, null, 2));

  //Retrieve and log the metadata state
  const updatedMetadata = await getTokenMetadata(
    connection,
    mint, // Mint Account address
  );
  console.log('\nUpdated Metadata:', JSON.stringify(updatedMetadata, null, 2));

  console.log('\nUpdated Metadata:', JSON.stringify(updatedMetadata, null, 2));

  console.log('\nMint Account:', `https://solana.fm/address/${mint}?cluster=devnet-solana`);

  console.log('\nTOKEN_2022_PROGRAM_ID:', TOKEN_2022_PROGRAM_ID.toBase58());

  try {
    const [associatedTokenAddress, accountAssociatedTokenAddress] = await Promise.all([
      getAssociatedTokenAddress(mint, payer.publicKey, false, TOKEN_2022_PROGRAM_ID),
      getAssociatedTokenAddress(mint, account, false, TOKEN_2022_PROGRAM_ID),
    ]);
    // const accountAssociatedTokenAddress = await getAssociatedTokenAddress(mint, account, false, TOKEN_2022_PROGRAM_ID);

    console.log('build associatedTokenAddress:', associatedTokenAddress.toBase58());

    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        associatedTokenAddress,
        payer.publicKey,
        mint,
        TOKEN_2022_PROGRAM_ID,
      ),
    );

    const transactionSignature = await sendAndConfirmTransaction(connection, transaction, [payer]);

    console.log(
      'buildCreateAssociatedTokenAccountTransaction Transaction successful with signature:',
      transactionSignature,
    );
    console.log(
      '\nbuildCreateAssociatedTokenAccountTransaction:',
      `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
    );

    //todo-end

    //todo-begin

    const transaction2 = new Transaction().add(
      createMintToInstruction(
        mint,
        associatedTokenAddress,
        authority,
        BigInt(timesDecimals(200, tokenInfo.decimals).toFixed(0)),
        [],
        TOKEN_2022_PROGRAM_ID,
      ),
    );

    const transactionSignature2 = await sendAndConfirmTransaction(connection, transaction2, [payer]);

    console.log('mintTo Transaction successful with signature:', transactionSignature2);
    console.log('\nmintTo:', `https://solana.fm/tx/${transactionSignature2}?cluster=devnet-solana`);
    //todo-end
  } catch (error) {
    console.error('Error creating associated token account:', error);
  }
}
