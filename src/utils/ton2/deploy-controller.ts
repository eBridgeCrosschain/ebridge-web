// lib/deploy-controller.ts
import BN from 'bn.js';
import { Address, beginCell, Cell, toNano } from 'ton';
import { ContractDeployer } from './contract-deployer';

import { createDeployParams, waitForContractDeploy, waitForSeqno } from './utils';
import { zeroAddress } from './utils';
import { buildJettonOnchainMetadata, burn, mintBody, transfer, updateMetadataBody } from './jetton-minter';
import { readJettonMetadata, changeAdminBody, JettonMetaDataKeys } from './jetton-minter';
export const JETTON_DEPLOY_GAS = toNano(0.25);

export enum JettonDeployState {
  NOT_STARTED,
  BALANCE_CHECK,
  UPLOAD_IMAGE,
  UPLOAD_METADATA,
  AWAITING_MINTER_DEPLOY,
  AWAITING_JWALLET_DEPLOY,
  VERIFY_MINT,
  ALREADY_DEPLOYED,
  DONE,
}

export interface JettonDeployParams {
  onchainMetaData?: {
    name: string;
    symbol: string;
    description?: string;
    image?: string;
    decimals?: string;
  };
  offchainUri?: string;
  owner: Address;
  amountToMint: BN;
}
