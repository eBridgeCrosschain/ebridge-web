import { CHAIN, TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import CommonButton from 'components/CommonButton';
import { getCreateTonTokenRequest } from 'utils/ton/createToken';
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

            const createTonTokenRequest = await getCreateTonTokenRequest({
              ownerAddress: wallet?.account.address,
              network: CHAIN.MAINNET,
              tokenInfo: {
                name: 'test on ton token name',
                description: 'test on ton token description',
                symbol: 'MASON',
                imageUri: 'https://avatars.githubusercontent.com/u/104382459?s=200&v=4',
                tokenMaxSupply: 10000,
              },
            });
            const result = await tonConnectUI.sendTransaction(createTonTokenRequest);

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
