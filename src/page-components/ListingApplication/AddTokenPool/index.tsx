import { LISTING_STEP_PATHNAME_MAP, ListingStep, WALLET_CONNECTION_REQUIRED } from 'constants/listingApplication';
import { useRouter } from 'next/router';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { ApplicationChainStatusEnum } from 'types/api';
import { sleep } from 'utils';
import { getApplicationDetail } from 'utils/api/application';
import ListingTip from '../ListingTip';
import { useAElf } from 'hooks/web3';
import { useSetAelfAuthFromStorage, useShowLoginButtonLoading } from 'hooks/aelfAuthToken';
import useMediaQueries from 'hooks/useMediaQueries';
import styles from './styles.module.less';
import { formatSymbol } from 'utils/token';
import { useAelfLogin } from 'hooks/wallet';
import eBridgeEventBus from 'utils/eBridgeEventBus';
import { formatWithCommas } from 'utils/calculate';
import EmptyDataBox from 'components/EmptyDataBox';
import CommonButton from 'components/CommonButton';
import { BUTTON_TEXT_SUBMIT, CONNECT_AELF_WALLET } from 'constants/misc';
import CommonSteps, { ICommonStepsProps } from 'components/CommonSteps';

export interface AddTokenPoolProps {
  id?: string;
  onNext?: () => void;
}

const AlreadyPoolAddedStatus = [
  ApplicationChainStatusEnum.Complete,
  ApplicationChainStatusEnum.Failed,
  ApplicationChainStatusEnum.LiquidityAdded,
];

function AddTokenPool({ id, onNext }: AddTokenPoolProps) {
  const router = useRouter();
  const currentId = useMemo(() => {
    if (router.query?.id && typeof router.query?.id === 'string') {
      return router.query?.id;
    }
    return id || '';
  }, [router.query?.id, id]);
  const isMd = useMediaQueries('md');
  const { isActive } = useAElf();
  const handleAelfLogin = useAelfLogin();
  const setAelfAuthFromStorage = useSetAelfAuthFromStorage();
  // Fix: It takes too long to obtain NightElf walletInfo, and the user mistakenly clicks the login button during this period.
  const isLoginButtonLoading = useShowLoginButtonLoading();
  const [tokenInfo, setTokenInfo] = useState({ symbol: '', icon: '', dailyLimit: '', rateLimit: '' });
  const [tokenPoolSteps, setTokenPoolSteps] = useState<ICommonStepsProps['stepItems']>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitDisabled, setSubmitDisable] = useState(true);

  const tipNode = useMemo(() => {
    return tokenInfo.symbol && tokenInfo.dailyLimit ? (
      <ListingTip
        title="Transfer limits"
        tip={
          <>
            <div className={isMd ? styles['tip-row-pad'] : styles['tip-row-web']}>
              {`1. Daily transfer limit: ${formatWithCommas({ amount: tokenInfo.dailyLimit })} ${formatSymbol(
                tokenInfo.symbol,
              )}`}
            </div>
            {tokenInfo.rateLimit && (
              <div
                className={isMd ? styles['tip-row-pad'] : styles['tip-row-web']}>{`2. Refill rate: ${formatWithCommas({
                amount: tokenInfo.rateLimit,
              })} ${formatSymbol(tokenInfo.symbol)}/second`}</div>
            )}
          </>
        }
      />
    ) : null;
  }, [isMd, tokenInfo.dailyLimit, tokenInfo.rateLimit, tokenInfo.symbol]);

  const getData = useCallback(
    async (id: string) => {
      if (!isActive) return;
      try {
        // isLoading && setLoading(true); // TODO

        await setAelfAuthFromStorage();
        await sleep(500);
        const res = await getApplicationDetail({ id });

        const chainTokenInfos = res[0]?.chainTokenInfo || [];
        const otherChainTokenInfos = res[0]?.otherChainTokenInfo;
        let concatList = [];
        if (otherChainTokenInfos) {
          concatList = chainTokenInfos?.concat([otherChainTokenInfos]);
        } else {
          concatList = chainTokenInfos;
        }

        if (concatList.length === 0) {
          router.push('/my-applications');
          return;
        }

        const _list: ICommonStepsProps['stepItems'] = [];
        concatList.forEach((item, index) => {
          _list.push({
            title: 'Add pool on ' + item.chainName,
          });

          if (!AlreadyPoolAddedStatus.includes(item.status)) {
            setCurrentStep(index);
          }
        });
        setTokenPoolSteps(_list);
        setTokenInfo({
          symbol: res[0].symbol,
          icon: concatList[0].icon,
          dailyLimit: otherChainTokenInfos?.dailyLimit || chainTokenInfos[0]?.dailyLimit || '0.00',
          rateLimit: otherChainTokenInfos?.rateLimit || chainTokenInfos[0]?.rateLimit || '0.00',
        });

        // submit but disable
        const unfinishedAelfTokenPool = concatList?.find((item) => !AlreadyPoolAddedStatus.includes(item.status));
        if (unfinishedAelfTokenPool?.chainId) {
          setSubmitDisable(true);
        } else {
          setSubmitDisable(false);
        }
      } catch (error) {
        console.log('InitializeLiquidityPool getData error', error);
      } finally {
        // setLoading(false);
      }
    },
    [isActive, router, setAelfAuthFromStorage],
  );

  const init = useCallback(async () => {
    if (currentId) {
      await getData(currentId);
    } else {
      router.replace(`/listing/${LISTING_STEP_PATHNAME_MAP[ListingStep.TOKEN_INFORMATION]}`);
    }
  }, [currentId, getData, router]);
  const initRef = useRef(init);
  initRef.current = init;

  const connectAndInit = useCallback(() => {
    if (!isActive) {
      handleAelfLogin(true, initRef.current);
    } else {
      initRef.current();
    }
  }, [handleAelfLogin, isActive]);
  const connectAndInitRef = useRef(connectAndInit);
  connectAndInitRef.current = connectAndInit;
  const connectAndInitSleep = useCallback(async () => {
    // setLoading(true); // TODO
    // Delay 3s to determine the login status, because the login data is acquired slowly, to prevent the login pop-up window from being displayed first and then automatically logging in successfully later.
    await sleep(3000);
    connectAndInitRef.current();
  }, []);
  useEffectOnce(() => {
    connectAndInitSleep();
  });

  const initForLogout = useCallback(async () => {
    setTokenPoolSteps([]);
    setTokenInfo({ symbol: '', icon: '', dailyLimit: '', rateLimit: '' });
    setSubmitDisable(true);
  }, []);
  const initLogoutRef = useRef(initForLogout);
  initLogoutRef.current = initForLogout;

  const initForReLogin = useCallback(async () => {
    initRef.current();
  }, []);
  const initForReLoginRef = useRef(initForReLogin);
  initForReLoginRef.current = initForReLogin;

  useEffectOnce(() => {
    // log in
    const { remove: removeLoginSuccess } = eBridgeEventBus.AelfLoginSuccess.addListener(() =>
      initForReLoginRef.current(),
    );
    // log out \ exit
    const { remove: removeLogoutSuccess } = eBridgeEventBus.AelfLogoutSuccess.addListener(() => {
      initLogoutRef.current();
    });

    return () => {
      removeLoginSuccess();
      removeLogoutSuccess();
    };
  });

  const renderMainContent = useMemo(() => {
    return (
      <div className={styles['token-pool-steps-wrapper']}>
        <CommonSteps
          className={styles['token-pool-steps']}
          stepItems={tokenPoolSteps}
          current={currentStep}
          direction={'vertical'}
        />
      </div>
    );
  }, [currentStep, tokenPoolSteps]);

  const renderInputAmountContent = useMemo(() => {
    return <div className={styles['token-pool-input-container']}></div>;
  }, []);

  return (
    <div className={styles['add-token-pool']}>
      <div className={styles['component-title-wrapper']}>
        <div className={styles['component-title']}>
          {`Add `}
          {tokenInfo.symbol ? formatSymbol(tokenInfo.symbol) : 'Token'}
          {` Pool`}
        </div>
        {tipNode}
      </div>
      {isActive ? (
        <>
          {renderMainContent}
          {renderInputAmountContent}
          <CommonButton className={styles['submit-button']} onClick={onNext} disabled={submitDisabled}>
            {BUTTON_TEXT_SUBMIT}
          </CommonButton>
        </>
      ) : (
        <>
          <EmptyDataBox text={WALLET_CONNECTION_REQUIRED} />
          <CommonButton
            className={styles['submit-button']}
            onClick={() => handleAelfLogin(true)}
            loading={isLoginButtonLoading}>
            {CONNECT_AELF_WALLET}
          </CommonButton>
        </>
      )}
    </div>
  );
}

export default memo(AddTokenPool);
