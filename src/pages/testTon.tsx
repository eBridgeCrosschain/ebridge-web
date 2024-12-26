import { Address, toNano, beginCell, contractAddress } from '@ton/core';
import { CHAIN, TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import CommonButton from 'components/CommonButton';
import { buildOnchainMetadata } from 'utils/ton/jettonHelpers';
import { SampleJetton, storeMint } from 'utils/ton/sampleJetton';
import base64 from 'base64-js';
export default function TestTon() {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  return (
    <div style={{ padding: 100 }}>
      <TonConnectButton />
      <CommonButton
        onClick={async () => {
          try {
            if (!wallet?.account.address) return;
            const workChain = 0; // workChain default 0

            const userAddress = Address.parse(wallet?.account.address);

            const jettonParams = {
              name: 'AELF ON TON',
              description: 'AELF TO THE MOON',
              symbol: 'AOT',
              image: 'https://avatars.githubusercontent.com/u/104382459?s=200&v=4',
            };

            const tokenMaxSupply = toNano(10000);
            const content = buildOnchainMetadata(jettonParams);
            const init = await SampleJetton.init(userAddress, content, tokenMaxSupply);
            const jettonMaster = contractAddress(workChain, init);

            const packedMsg = beginCell()
              .store(
                storeMint({
                  $$type: 'Mint',
                  amount: tokenMaxSupply,
                  receiver: userAddress,
                }),
              )
              .endCell();

            const StateInit = base64.fromByteArray(
              beginCell()
                .storeUint(0, 2)
                .storeMaybeRef(init.code)
                .storeMaybeRef(init.data)
                .storeUint(0, 1)
                .endCell()
                .toBoc(),
            );

            const Payload = base64.fromByteArray(packedMsg.toBoc());
            const result = await tonConnectUI.sendTransaction({
              validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
              network: CHAIN.TESTNET,
              messages: [
                {
                  address: jettonMaster.toString(),
                  amount: toNano('0.25').toString(),
                  stateInit: StateInit, // just for instance. Replace with your transaction initState or remove},{address: "EQDmnxDMhId6v1Ofg_h5KR5coWlFG6e86Ro3pc7Tq4CA0-Jn",amount: "60000000",//
                  payload: Payload, // just for instance. Replace with your transaction payload or remove
                },
              ],
            });

            console.log(result, '===result');

            // // you can use signed boc to find the transaction
            // const someTxData = await myAppExplorerService.getTransaction(result.boc);
            // alert('Transaction was sent successfully', someTxData);
          } catch (error) {
            console.log(error, '=====error');
          }
        }}>
        Contract
      </CommonButton>
    </div>
  );
}
