import { basicActions } from 'contexts/utils';
import { ContractBasic } from 'utils/contract';

export enum AElfContractActions {
  setContract = 'SET_CONTRACT',
  destroy = 'DESTROY',
}

export type AElfContractState = { [key: string]: ContractBasic };

export const basicAElfContractActions = {
  setContract: (contract: { [key: string]: ContractBasic }) =>
    basicActions(AElfContractActions['setContract'], contract),
  aelfContractDestroy: () => basicActions(AElfContractActions['destroy']),
};

export const { setContract, aelfContractDestroy } = basicAElfContractActions;
