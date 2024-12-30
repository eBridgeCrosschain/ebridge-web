// lib/contract-deployer.ts
import BN from 'bn.js';
import { Address, beginCell, Cell, contractAddress, StateInit } from 'ton';
interface ContractDeployDetails {
  deployer: Address;
  value: BN;
  code: Cell;
  data: Cell;
  message?: Cell;
  dryRun?: boolean;
}

export class ContractDeployer {
  addressForContract(params: ContractDeployDetails) {
    return contractAddress({
      workchain: 0,
      initialData: params.data,
      initialCode: params.code,
    });
  }
}
