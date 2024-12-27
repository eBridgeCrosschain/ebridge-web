import { LISTING_STEP_PATHNAME_MAP, ListingStep, WALLET_CONNECTION_REQUIRED } from 'constants/listingApplication';
import { useRouter } from 'next/router';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { ApplicationChainStatusEnum, TApplicationDetailItemChainTokenInfo } from 'types/api';
import { sleep } from 'utils';
import { changeAddLiquidityStatus, getApplicationDetail } from 'utils/api/application';
import ListingTip from '../ListingTip';
import { useAElf, useEVMSwitchChain, useWeb3 } from 'hooks/web3';
import { useSetAelfAuthFromStorage, useShowLoginButtonLoading } from 'hooks/aelfAuthToken';
import useMediaQueries from 'hooks/useMediaQueries';
import styles from './styles.module.less';
import { formatSymbol } from 'utils/token';
import { useAelfLogin } from 'hooks/wallet';
import eBridgeEventBus from 'utils/eBridgeEventBus';
import { AmountSign, divDecimals, formatWithCommas } from 'utils/calculate';
import EmptyDataBox from 'components/EmptyDataBox';
import CommonButton from 'components/CommonButton';
import { CONNECT_AELF_WALLET, ZERO } from 'constants/misc';
import CommonSteps, { ICommonStepsProps } from 'components/CommonSteps';
import CommonAmountRow from 'components/CommonAmountRow';
import useGlobalLoading from 'hooks/useGlobalLoading';
import { useConnect } from 'hooks/useConnect';
import { useBalances } from 'hooks/useBalances';
import { getMaxAmount, parseInputChange } from 'utils/input';
import { unitConverter } from 'utils/converter';
import { Row } from 'antd';
import TokenLogo from 'components/TokenLogo';
import clsx from 'clsx';
import { TBridgeChainId } from 'constants/chain';
import { isELFChain } from 'utils/aelfUtils';
import { useThrottleCallback } from 'hooks';
import { usePoolContract, useTokenContract } from 'hooks/useContract';
import { addLiquidity } from 'utils/pools';
import { getChainIdByAPI, getChainName, getChainType } from 'utils/chain';
import { useTokenPrice } from 'hooks/token';
import { ROUTE_PATHS } from 'constants/link';
import BigNumber from 'bignumber.js';
import CommonMessage from 'components/CommonMessage';
import { handleErrorMessage } from 'utils/error';

export interface AddTokenPoolProps {
  id?: string;
  symbol?: string;
  onNext?: () => void;
}

const AlreadyPoolAddedStatus = [
  ApplicationChainStatusEnum.Complete,
  ApplicationChainStatusEnum.Failed,
  ApplicationChainStatusEnum.LiquidityAdded,
];

function AddTokenPool({ id, symbol, onNext }: AddTokenPoolProps) {
  const router = useRouter();
  const currentId = useMemo(() => {
    if (router.query?.id && typeof router.query?.id === 'string') {
      return router.query?.id;
    }
    return id || '';
  }, [router.query?.id, id]);
  const currentSymbol = useMemo(() => {
    if (router.query?.symbol && typeof router.query?.symbol === 'string') {
      return router.query?.symbol;
    }
    return symbol || '';
  }, [router.query?.symbol, symbol]);

  const isMd = useMediaQueries('md');
  const { setGlobalLoading } = useGlobalLoading();
  const [loadingOpen, setLoadingOpen] = useState(false);

  // wallet data
  const web3Wallet = useWeb3();
  const { account: web3Account, library: web3Library } = web3Wallet || {};
  const evmSwitchChain = useEVMSwitchChain();
  const connect = useConnect();
  const aelfWallet = useAElf();
  const { isActive: isAelfActive, account: aelfAccount, library: aelfLibrary } = aelfWallet || {};
  const handleAelfLogin = useAelfLogin();
  const setAelfAuthFromStorage = useSetAelfAuthFromStorage();
  // Fix: It takes too long to obtain NightElf walletInfo, and the user mistakenly clicks the login button during this period.
  const isLoginButtonLoading = useShowLoginButtonLoading();

  // page data
  const [currentChainId, setCurrentChainId] = useState<TBridgeChainId>();
  const currentChainIdFormat = useMemo(() => getChainIdByAPI((currentChainId as string) || ''), [currentChainId]);
  const currentAccount = useMemo(() => {
    if (isELFChain(currentChainIdFormat)) {
      return aelfAccount;
    } else {
      return web3Account;
    }
  }, [aelfAccount, currentChainIdFormat, web3Account]);
  const [tokenInfoList, setTokenInfoList] = useState<TApplicationDetailItemChainTokenInfo[]>([]);
  const [currentTokenInfo, setCurrentTokenInfo] = useState<TApplicationDetailItemChainTokenInfo | undefined>();
  const [tokenPoolSteps, setTokenPoolSteps] = useState<ICommonStepsProps['stepItems']>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const alreadySetCurrentStepRef = useRef(false);
  const [submitDisabled, setSubmitDisable] = useState(true);
  const [amount, setAmount] = useState<string>();
  const { price } = useTokenPrice(currentSymbol);
  const [[balance]] = useBalances(
    useMemo(() => {
      return isELFChain(currentChainIdFormat)
        ? { ...aelfWallet, chainId: currentChainIdFormat }
        : { ...web3Wallet, chainId: currentChainIdFormat };
    }, [aelfWallet, currentChainIdFormat, web3Wallet]),
    useMemo(() => {
      if (isELFChain(currentChainIdFormat))
        return [
          {
            name: currentTokenInfo?.tokenName,
            decimals: currentTokenInfo?.decimals || 0,
            symbol: currentTokenInfo?.symbol || '',
            address: currentTokenInfo?.contractAddress,
          },
        ];
      return [currentTokenInfo?.contractAddress];
    }, [
      currentChainIdFormat,
      currentTokenInfo?.tokenName,
      currentTokenInfo?.decimals,
      currentTokenInfo?.symbol,
      currentTokenInfo?.contractAddress,
    ]),
  );
  const showBalance = useMemo(
    () => divDecimals(balance, currentTokenInfo?.decimals),
    [balance, currentTokenInfo?.decimals],
  );
  const min = useMemo(() => divDecimals(1, currentTokenInfo?.decimals), [currentTokenInfo?.decimals]);
  const max = useMemo(
    () => getMaxAmount({ chainId: currentChainIdFormat, symbol: currentTokenInfo?.symbol, balance: showBalance }),
    [currentChainIdFormat, currentTokenInfo?.symbol, showBalance],
  );
  const inputAmountMin = useMemo(() => {
    if (!currentTokenInfo?.minAmount) return min.dp(4, BigNumber.ROUND_CEIL).toFixed();
    return ZERO.plus(currentTokenInfo?.minAmount).div(price).dp(4, BigNumber.ROUND_CEIL).toFixed();
  }, [currentTokenInfo?.minAmount, min, price]);
  const showError = useMemo(() => amount && currentAccount && max.lt(amount), [amount, currentAccount, max]);
  const poolContract = usePoolContract(
    currentChainIdFormat,
    undefined,
    isELFChain(currentChainIdFormat) ? aelfWallet?.isPortkey : web3Wallet?.isPortkey,
  );
  const tokenContract = useTokenContract(
    currentChainIdFormat,
    currentTokenInfo?.contractAddress,
    isELFChain(currentChainIdFormat) ? aelfWallet?.isPortkey : web3Wallet?.isPortkey,
  );

  const tipNode = useMemo(() => {
    return currentTokenInfo?.symbol && currentTokenInfo?.dailyLimit ? (
      <ListingTip
        title="Transfer limits"
        tip={
          <>
            <div className={isMd ? styles['tip-row-pad'] : styles['tip-row-web']}>
              {`1. Daily transfer limit: ${formatWithCommas({ amount: currentTokenInfo.dailyLimit })} ${formatSymbol(
                currentTokenInfo.symbol,
              )}`}
            </div>
            {currentTokenInfo?.rateLimit && (
              <div
                className={isMd ? styles['tip-row-pad'] : styles['tip-row-web']}>{`2. Refill rate: ${formatWithCommas({
                amount: currentTokenInfo.rateLimit,
              })} ${formatSymbol(currentTokenInfo.symbol)}/second`}</div>
            )}
          </>
        }
      />
    ) : null;
  }, [currentTokenInfo?.dailyLimit, currentTokenInfo?.rateLimit, currentTokenInfo?.symbol, isMd]);

  const getData = useCallback(async () => {
    if (!isAelfActive) return;
    try {
      setGlobalLoading(true);

      await setAelfAuthFromStorage();
      await sleep(500);
      const res = await getApplicationDetail({ id: currentId, symbol: currentSymbol });

      const chainTokenInfos = res[0]?.chainTokenInfo || [];
      const otherChainTokenInfos = res[0]?.otherChainTokenInfo;
      let concatList = [];
      if (otherChainTokenInfos) {
        concatList = chainTokenInfos?.concat([otherChainTokenInfos]);
      } else {
        concatList = chainTokenInfos;
      }

      // if all chain-pool is not initialized, go my-applications page
      const _poolInitializingList = concatList.filter(
        (item) => item.status === ApplicationChainStatusEnum.PoolInitializing,
      );
      // if all chain-pool is not added, go my-applications page
      const _poolAddedList = concatList.filter((item) => AlreadyPoolAddedStatus.includes(item.status));
      if (
        concatList.length === 0 ||
        _poolInitializingList.length === concatList.length ||
        _poolAddedList.length === concatList.length
      ) {
        router.push(ROUTE_PATHS.MY_APPLICATIONS);
        return;
      }

      setTokenInfoList(concatList);
      const _list: ICommonStepsProps['stepItems'] = [];
      concatList.forEach((item, index) => {
        _list.push({
          title: 'Add pool on ' + getChainName(getChainIdByAPI(item.chainId)),
        });

        if (!alreadySetCurrentStepRef.current && !AlreadyPoolAddedStatus.includes(item.status)) {
          setCurrentStep(index);
          alreadySetCurrentStepRef.current = true;
          setCurrentTokenInfo(item);
          setCurrentChainId(item.chainId as TBridgeChainId);
        }
      });
      setTokenPoolSteps(_list);

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
      setGlobalLoading(false);
    }
  }, [currentId, currentSymbol, isAelfActive, router, setAelfAuthFromStorage, setGlobalLoading]);

  const init = useCallback(async () => {
    if (currentId) {
      await getData();
    } else {
      router.replace(`/listing/${LISTING_STEP_PATHNAME_MAP[ListingStep.TOKEN_INFORMATION]}`);
    }
  }, [currentId, getData, router]);
  const initRef = useRef(init);
  initRef.current = init;

  const connectAndInit = useCallback(() => {
    if (!isAelfActive) {
      handleAelfLogin(true, initRef.current);
    } else {
      initRef.current();
    }
  }, [handleAelfLogin, isAelfActive]);
  const connectAndInitRef = useRef(connectAndInit);
  connectAndInitRef.current = connectAndInit;
  const connectAndInitSleep = useCallback(async () => {
    setGlobalLoading(true);
    // Delay 3s to determine the login status, because the login data is acquired slowly, to prevent the login pop-up window from being displayed first and then automatically logging in successfully later.
    await sleep(3000);
    connectAndInitRef.current();
  }, [setGlobalLoading]);
  useEffectOnce(() => {
    connectAndInitSleep();
  });

  const initForLogout = useCallback(async () => {
    setTokenPoolSteps([]);
    setCurrentTokenInfo(undefined);
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
        {tokenInfoList.length === 0 ? null : tokenInfoList.length > 1 ? (
          <CommonSteps
            className={styles['token-pool-steps']}
            stepItems={tokenPoolSteps}
            current={currentStep}
            direction={isMd ? 'vertical' : 'horizontal'}
          />
        ) : (
          <div className={styles['token-pool-step-title']}>{tokenPoolSteps?.[0].title}</div>
        )}
      </div>
    );
  }, [currentStep, isMd, tokenInfoList.length, tokenPoolSteps]);

  const onAddLiquidity = useThrottleCallback(async () => {
    try {
      if (
        !currentChainId ||
        !currentChainIdFormat ||
        !currentTokenInfo ||
        !currentAccount ||
        !tokenContract ||
        !poolContract ||
        !amount
      )
        return;
      setGlobalLoading(true);
      setLoadingOpen(true);
      if (poolContract.contractType === 'ERC') await evmSwitchChain(currentChainIdFormat);
      const req = await addLiquidity({
        symbol: currentTokenInfo?.symbol,
        amount: amount,
        account: currentAccount,
        library: isELFChain(currentChainIdFormat) ? aelfLibrary : web3Library,
        poolContract,
        chainId: currentChainIdFormat,
        tokenContract,
        tokenInfo: {
          symbol: currentTokenInfo?.symbol,
          address: currentTokenInfo?.contractAddress,
          isNativeToken: false,
          decimals: currentTokenInfo?.decimals,
        },
      });
      setGlobalLoading(false);
      setLoadingOpen(false);
      console.log(req, '=====req');
      if (req.error) {
        CommonMessage.error(handleErrorMessage(req.error));
      } else {
        setAmount('');

        // No need to display error messages
        changeAddLiquidityStatus({
          orderId: currentId,
          chainId: currentChainId,
          amount,
        });

        if (currentStep < tokenInfoList.length - 1) {
          const _nextStepIndex = currentStep + 1;
          setCurrentStep(_nextStepIndex);
          alreadySetCurrentStepRef.current = true;
          setCurrentTokenInfo(tokenInfoList[_nextStepIndex]);
          setCurrentChainId(tokenInfoList[_nextStepIndex].chainId as TBridgeChainId);
        } else if (currentStep === tokenInfoList.length - 1) {
          await sleep(200);
          onNext?.();
        }
      }
    } catch (error) {
      setGlobalLoading(false);
      setLoadingOpen(false);
      CommonMessage.error(handleErrorMessage(error));
    }
  }, [
    aelfLibrary,
    amount,
    currentAccount,
    currentChainId,
    currentChainIdFormat,
    currentId,
    currentStep,
    currentTokenInfo,
    evmSwitchChain,
    onNext,
    poolContract,
    setGlobalLoading,
    tokenContract,
    tokenInfoList,
    web3Library,
  ]);

  const btnProps = useMemo(() => {
    let children = 'Enter Amount';
    let disabled = submitDisabled;
    let onClick = onAddLiquidity;

    if (!currentAccount && currentChainIdFormat) {
      onClick = () => connect(getChainType(currentChainIdFormat), currentChainIdFormat);
      children = 'Connect';
      disabled = false;
      return { children, disabled, onClick };
    }

    if (max.lt(amount ?? '0') && currentChainIdFormat) {
      disabled = true;
      onClick = () => connect(getChainType(currentChainIdFormat), currentChainIdFormat);
      children = 'Insufficient balance';
      return { children, disabled, onClick };
    }

    if (amount !== '0' && amount && ZERO.lte(amount) && ZERO.plus(inputAmountMin).lte(amount)) {
      children = 'Add';
      disabled = false;
    }

    return { children, disabled, onClick };
  }, [amount, connect, currentAccount, currentChainIdFormat, inputAmountMin, max, onAddLiquidity, submitDisabled]);

  const renderInputAmountContent = useMemo(() => {
    return (
      <div className={styles['token-pool-input-container']}>
        <CommonAmountRow
          inputWrapClassName={clsx(
            styles['token-pool-input-wrap'],
            !!showError && styles['token-pool-input-wrap-error'],
          )}
          placeholder={'Min ' + inputAmountMin}
          showBalance={!!currentAccount}
          showError={!!showError}
          value={amount}
          onClickMAX={() => setAmount(parseInputChange(max.toFixed(), min, currentTokenInfo?.decimals))}
          onAmountInputChange={(e) => setAmount(parseInputChange(e.target.value, min, currentTokenInfo?.decimals))}
          leftHeaderTitle={'Amount'}
          rightHeaderTitle={`${unitConverter(showBalance)} ${formatSymbol(currentTokenInfo?.symbol)}`}
          rightInputEle={
            <Row className={clsx('flex-row-center', styles['token-logo-row'], 'font-family-medium')}>
              <TokenLogo
                className={styles['token-logo']}
                chainId={currentChainIdFormat}
                symbol={currentTokenInfo?.symbol}
                src={currentTokenInfo?.icon}
              />
              <div>{formatSymbol(currentTokenInfo?.symbol)}</div>
            </Row>
          }
        />
        <div className={styles['estimated-value']}>
          {`Estimated value: $${unitConverter(ZERO.plus(amount ?? 0).times(price))}`}
        </div>
        {amount && ZERO.lte(amount) && ZERO.plus(inputAmountMin).gt(amount) && (
          <div className={styles['input-error-tip']}>{`Liquidity cannot be less than ${formatWithCommas({
            amount: currentTokenInfo?.minAmount,
            sign: AmountSign.USD,
          })}.`}</div>
        )}
      </div>
    );
  }, [
    amount,
    currentAccount,
    currentChainIdFormat,
    currentTokenInfo?.decimals,
    currentTokenInfo?.icon,
    currentTokenInfo?.minAmount,
    currentTokenInfo?.symbol,
    inputAmountMin,
    max,
    min,
    price,
    showBalance,
    showError,
  ]);

  return (
    <div className={styles['add-token-pool']}>
      <div className={styles['component-title-wrapper']}>
        <div className={styles['component-title']}>
          {`Add `}
          {currentTokenInfo?.symbol ? formatSymbol(currentTokenInfo.symbol) : 'Token'}
          {` Pool`}
        </div>
        {tipNode}
      </div>

      {isAelfActive ? (
        <>
          {renderMainContent}
          {renderInputAmountContent}
          <div className={styles['action-btn-wrapper']}>
            <CommonButton
              {...btnProps}
              loading={loadingOpen}
              type="primary"
              className={clsx(styles['action-btn'], loadingOpen && styles['action-btn-loading'])}>
              {btnProps.children}
            </CommonButton>
          </div>
        </>
      ) : (
        <>
          <EmptyDataBox text={WALLET_CONNECTION_REQUIRED} />
          <div className={styles['action-btn-wrapper']}>
            <CommonButton
              className={styles['action-btn']}
              type="primary"
              onClick={() => handleAelfLogin(true)}
              loading={isLoginButtonLoading}>
              {CONNECT_AELF_WALLET}
            </CommonButton>
          </div>
        </>
      )}
    </div>
  );
}

export default memo(AddTokenPool);
