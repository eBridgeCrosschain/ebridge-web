import MainContentHeader from 'components/MainContentHeader';
import PageHead from 'components/PageHead';
import useMediaQueries from 'hooks/useMediaQueries';
import { useLanguage } from 'i18n';
import { memo } from 'react';
import styles from './styles.module.less';
import { Button, Col, Row } from 'antd';
import { SupportedChainId } from 'constants/chain';
import { useWeb3 } from 'hooks/web3';
import { usePoolContract, useTokenContract } from 'hooks/useContract';
import { addLiquidity, removeLiquidity } from 'utils/pools';
import { getTransactionReceiptAutoRetry } from 'utils/config';

// const chainId = SupportedELFChainId.tDVW;
const chainId = SupportedChainId.SEPOLIA;

const Pools = () => {
  const { t } = useLanguage();
  const isMd = useMediaQueries('md');
  // MOCK Token Address
  const tokenContract = useTokenContract(chainId, '0x60eeCc4d19f65B9EaDe628F2711C543eD1cE6679');
  const poolContract = usePoolContract(chainId);
  const { account, library } = useWeb3();

  return (
    <>
      <PageHead title={t('eBridge: Cross-chain Bridge')} />
      <div>
        <MainContentHeader
          wrap={isMd}
          title={t('Pools')}
          // TODO: tip
          tipConfig={{
            label: t('Can’t find your token?'),
            content: (
              <div className={styles['tooltip-content']}>
                <p className={styles['tooltip-title']}>
                  {t('Tips')}
                  {t(':')}
                </p>
                <ol>
                  <li>{t('Check the transaction status from the transaction records.')}</li>
                  <li>{t('For more details, click on the From/To TXID to track its progress on the Explorer.')}</li>
                </ol>
              </div>
            ),
          }}
        />
        <Button
          onClick={async () => {
            // Mock addLiquidity
            try {
              if (!account || !tokenContract || !poolContract) return;
              const req = await addLiquidity({
                symbol: 'ETH',
                amount: '0.01',
                account: account,
                library: library as any,
                poolContract,
                chainId,
              });
              console.log(req, '=====req');
            } catch (error) {
              console.log(error, '====error');
            }
          }}>
          poolContract
        </Button>

        <Button
          onClick={async () => {
            // Mock removeLiquidity
            try {
              if (!account || !tokenContract || !poolContract) return;
              const req = await removeLiquidity({
                symbol: 'ETH',
                amount: '0.01',
                account: account,
                poolContract,
                chainId,
              });
              console.log(req, '=====req');
            } catch (error) {
              console.log(error, '====error');
            }
          }}>
          removeLiquidity
        </Button>
        <Button
          onClick={async () => {
            // Mock removeLiquidity
            try {
              if (!account || !tokenContract || !poolContract) return;

              const req = await tokenContract?.callSendMethod(
                'transfer',
                account,
                ['0x5E1447C7F5cc10861Cf0260628814c3117fAc9B1', '1000000000000000000000000000000000000000000'],
                {
                  onMethod: 'transactionHash',
                },
              );
              console.log(req, '=====req');
              const data = await getTransactionReceiptAutoRetry({
                chainId: SupportedChainId.SEPOLIA,
                hash: req.TransactionId,
              });
              console.log(data, '=====data');
            } catch (error) {
              console.log(error, '====error');
            }
          }}>
          Transfer
        </Button>
        {/* <Button
          onClick={async () => {
            try {
              const tokenInfo = getTokenInfoByWhitelist(chainId as ChainId, 'ELF');
              console.log(tokenInfo, '==tokenInfo');

              const req = await poolContract?.callViewMethod('admin', null);
              console.log(req, '====req');
            } catch (error) {
              console.log(error, '====error');
            }
          }}>
          poolContract EVM
        </Button> */}
        <Row>
          <Col span={6}>Total TVL</Col>
          <Col span={6}>Your Total Liquidity</Col>
          <Col span={6}>Pools</Col>
          <Col span={6}>Tokens</Col>
        </Row>
      </div>
    </>
  );
};

export default memo(Pools);
