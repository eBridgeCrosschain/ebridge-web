import { JettonDeployParams } from './deploy-controller';
import { Address, Cell, StateInit, toNano } from 'ton';
import { toDecimalsBN, createDeployParams } from './utils';
import { ContractDeployer } from './contract-deployer';
import { SendTransactionRequest } from '@tonconnect/ui-react';

export async function getCreateTonTokenRequest({
  ownerAddress,
  tokenInfo,
  network,
}: {
  ownerAddress: string;
  network?: SendTransactionRequest['network'];
  tokenInfo: {
    name: string;
    description: string;
    symbol: string;
    imageUri: string;
    tokenMaxSupply: number;
    decimals: string;
    offchainUri?: string;
  };
}) {
  const params: JettonDeployParams = {
    owner: Address.parse(ownerAddress),
    onchainMetaData: {
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      image: tokenInfo.imageUri,
      description: tokenInfo.description,
      decimals: parseInt(tokenInfo.decimals).toFixed(0),
    },
    offchainUri: tokenInfo.offchainUri,
    amountToMint: toDecimalsBN(tokenInfo.tokenMaxSupply, tokenInfo.decimals),
  };
  const deployParams = createDeployParams(params, tokenInfo.offchainUri);

  const contractAddress = new ContractDeployer().addressForContract(deployParams);
  const cell = new Cell();
  new StateInit({ data: deployParams.data, code: deployParams.code }).writeTo(cell);
  const payload = deployParams.message.toBoc().toString('base64');

  return {
    validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
    network,
    messages: [
      {
        address: contractAddress.toString(),
        amount: toNano('0.25').toString(),
        stateInit: cell.toBoc().toString('base64'), // just for instance. Replace with your transaction initState or remove},{address: "EQDmnxDMhId6v1Ofg_h5KR5coWlFG6e86Ro3pc7Tq4CA0-Jn",amount: "60000000",//
        payload, // just for instance. Replace with your transaction payload or remove
      },
    ],
  };
}
