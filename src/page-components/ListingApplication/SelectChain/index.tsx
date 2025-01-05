import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEffectOnce } from 'react-use';
import clsx from 'clsx';
import { Form, Checkbox, Row, Col, Input } from 'antd';
import CommonMessage from 'components/CommonMessage';
import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import CommonTooltipSwitchModal, { ICommonTooltipSwitchModalRef } from 'components/CommonTooltipSwitchModal';
import EmptyDataBox from 'components/EmptyDataBox';
import IconFont from 'components/IconFont';
import TokenRow from '../TokenRow';
import ListingTip from '../ListingTip';
import CreationProgressModal, { ICreationProgressModalProps } from './CreationProgressModal';
import {
  TSelectChainFormValues,
  SelectChainFormKeys,
  TTokenItem,
  TSelectChainFormValidateData,
  FormValidateStatus,
  TChains,
  TSearchParams,
} from 'types/listingApplication';
import { ApplicationChainStatusEnum, TApplicationChainStatusItem } from 'types/api';
import { WalletTypeEnum } from 'types/wallet';
import {
  SELECT_CHAIN_FORM_CHAIN_CREATED_NOT_LISTED_STATUS_LIST,
  SELECT_CHAIN_FORM_CHAIN_DISABLED_STATUS_LIST,
  SELECT_CHAIN_FORM_CHAIN_LISTED_STATUS_LIST,
  SELECT_CHAIN_FORM_CHAIN_TOOLTIP_MAP,
  SELECT_CHAIN_FORM_INITIAL_VALUES,
  SELECT_CHAIN_FORM_INITIAL_VALIDATE_DATA,
  SELECT_CHAIN_FORM_LABEL_MAP,
  SELECT_CHAIN_FORM_PLACEHOLDER_MAP,
  REQUIRED_ERROR_MESSAGE,
  DEFAULT_CHAINS,
  WALLET_CONNECTION_REQUIRED,
  ListingStep,
  LISTING_STEP_ITEMS,
} from 'constants/listingApplication';
import { BUTTON_TEXT_BACK, SELECT_CHAIN, ZERO, LANG_MAX } from 'constants/misc';
import useGlobalLoading from 'hooks/useGlobalLoading';
import { useAElf, useTon, useWeb3 } from 'hooks/web3';
import { useConnect } from 'hooks/useConnect';
import { useSetAelfAuthFromStorage } from 'hooks/aelfAuthToken';
import { useMobile } from 'contexts/useStore/hooks';
import {
  getApplicationTokenList,
  getApplicationChainStatusList,
  addApplicationChain,
  getApplicationTokenInfo,
} from 'utils/api/application';
import { formatWithCommas } from 'utils/calculate';
import { formatListWithAnd, parseWithCommas, parseWithStringCommas } from 'utils/format';
import { handleInputFocus } from 'utils/input';
import { handleListingErrorMessage } from 'utils/error';
import { getChainIdByAPI, getChainName, getIconByAPIChainId } from 'utils/chain';
import { isEVMChain, isTONChain } from 'utils/wallet';
import eBridgeEventBus from 'utils/eBridgeEventBus';
import { sleep } from 'utils';
import styles from './styles.module.less';

interface ISelectChainProps {
  symbol?: string;
  handleNextStep: (params?: TSearchParams) => void;
  handlePrevStep: (params?: TSearchParams) => void;
}

export default function SelectChain({ symbol, handleNextStep, handlePrevStep }: ISelectChainProps) {
  const isMobile = useMobile();
  const { setGlobalLoading } = useGlobalLoading();
  const connect = useConnect();
  const { account: aelfAccount } = useAElf();
  const { account: evmAccount } = useWeb3();
  const { account: tonAccount } = useTon();
  const { isAelfConnected, isEVMConnected, isTONConnected } = useMemo(
    () => ({
      isAelfConnected: !!aelfAccount,
      isEVMConnected: !!evmAccount,
      isTONConnected: !!tonAccount,
    }),
    [aelfAccount, evmAccount, tonAccount],
  );
  const setAelfAuthFromStorage = useSetAelfAuthFromStorage();
  const [form] = Form.useForm<TSelectChainFormValues>();
  const tooltipSwitchModalsRef = useRef<Record<string, ICommonTooltipSwitchModalRef | null>>({});

  const [formData, setFormData] = useState(SELECT_CHAIN_FORM_INITIAL_VALUES);
  const [formValidateData, setFormValidateData] = useState(SELECT_CHAIN_FORM_INITIAL_VALIDATE_DATA);
  const [chainListData, setChainListData] = useState<TChains>(DEFAULT_CHAINS);
  const [creationProgressModalProps, setCreationProgressModalProps] = useState<
    Pick<ICreationProgressModalProps, 'open' | 'chains'>
  >({
    open: false,
    chains: [],
  });
  const [token, setToken] = useState<TTokenItem | undefined>();
  const [isShowInitialSupplyFormItem, setIsShowInitialSupplyFormItem] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const handleBackStep = useCallback(() => {
    handlePrevStep({ symbol });
  }, [handlePrevStep, symbol]);

  const getToken = useCallback(async () => {
    if (!symbol) return;
    // TODO
    const res = await getApplicationTokenList({});
    const list = (res.tokenList || []).map((item) => ({
      name: item.tokenName,
      symbol: item.symbol,
      icon: item.tokenImage,
      liquidityInUsd: item.liquidityInUsd,
      holders: item.holders,
    }));
    const _token = list.find((item) => item.symbol === symbol);
    if (_token) {
      const tokenInfo = await getApplicationTokenInfo({ symbol });
      if (tokenInfo && tokenInfo.symbol) {
        setToken(_token);
      } else {
        throw new Error('Failed to get token info');
      }
    } else {
      throw new Error('Token not found');
    }
  }, [symbol]);

  const getChainList = useCallback(async () => {
    if (!symbol) return;
    const res = await getApplicationChainStatusList({ symbol });
    const _chains = (res.chainList || []).map((item) => ({
      ...item,
      chainName: getChainName(getChainIdByAPI(item.chainId)),
    }));

    const listData = {
      [SelectChainFormKeys.CHAINS]: _chains,
    };
    setChainListData(listData);
  }, [symbol]);

  const judgeIsChainDisabled = useCallback((status: ApplicationChainStatusEnum): boolean => {
    return SELECT_CHAIN_FORM_CHAIN_DISABLED_STATUS_LIST.includes(status);
  }, []);

  const hasDisabledChain = useMemo(
    () => chainListData[SelectChainFormKeys.CHAINS].some((chain) => judgeIsChainDisabled(chain.status)),
    [chainListData, judgeIsChainDisabled],
  );

  const judgeIsShowInitialSupplyFormItem = useCallback((currentChains: TApplicationChainStatusItem[]): boolean => {
    return currentChains.some((v) => v.status === ApplicationChainStatusEnum.Unissued);
  }, []);

  const judgeIsTokenError = useCallback(() => !token, [token]);

  const judgeIsChainsError = useCallback(
    ({ chains }: { chains: TApplicationChainStatusItem[] }): boolean => {
      const isChainSelected = hasDisabledChain || chains.length > 0;
      const hasValue = chains.length > 0;

      if (isChainSelected && hasValue) {
        return false;
      }
      return true;
    },
    [hasDisabledChain],
  );

  const judgeIsInitialSupplyError = useCallback(
    ({
      _isShowInitialSupplyFormItem,
      value,
      validateStatus,
    }: {
      _isShowInitialSupplyFormItem: boolean;
      value: string;
      validateStatus?: FormValidateStatus;
    }): boolean =>
      _isShowInitialSupplyFormItem && (!value || (!!validateStatus && validateStatus === FormValidateStatus.Error)),
    [],
  );

  const unconnectedWallets = useMemo(() => {
    const list: WalletTypeEnum[] = [];
    formData[SelectChainFormKeys.CHAINS].forEach((item) => {
      if (isEVMChain(item.chainId) && !isEVMConnected) {
        list.push(WalletTypeEnum.EVM);
      } else if (isTONChain(item.chainId) && !isTONConnected) {
        list.push(WalletTypeEnum.TON);
      }
    });
    return [...new Set(list)];
  }, [formData, isEVMConnected, isTONConnected]);

  const judgeIsButtonDisabled = useCallback(() => {
    const isDisabled =
      judgeIsTokenError() ||
      judgeIsChainsError({
        chains: formData[SelectChainFormKeys.CHAINS],
      }) ||
      judgeIsInitialSupplyError({
        _isShowInitialSupplyFormItem: isShowInitialSupplyFormItem,
        value: formData[SelectChainFormKeys.INITIAL_SUPPLY],
        validateStatus: formValidateData[SelectChainFormKeys.INITIAL_SUPPLY].validateStatus,
      });
    setIsButtonDisabled(isDisabled);
  }, [
    judgeIsTokenError,
    judgeIsChainsError,
    judgeIsInitialSupplyError,
    formData,
    formValidateData,
    isShowInitialSupplyFormItem,
  ]);

  useEffect(() => {
    judgeIsButtonDisabled();
  }, [judgeIsButtonDisabled]);

  const handleFormDataChange = useCallback(
    ({
      formKey,
      value,
      validateData,
    }: {
      formKey: SelectChainFormKeys;
      value: TSelectChainFormValues[SelectChainFormKeys];
      validateData?: TSelectChainFormValidateData[SelectChainFormKeys.INITIAL_SUPPLY];
    }) => {
      const newFormData = { ...formData, [formKey]: value };
      setFormData(newFormData);

      let newFormValidateData = formValidateData;
      if (validateData) {
        newFormValidateData = {
          ...newFormValidateData,
          [formKey]: validateData,
        };
        setFormValidateData(newFormValidateData);
      }

      const _isShowInitialSupplyFormItem = judgeIsShowInitialSupplyFormItem(newFormData[SelectChainFormKeys.CHAINS]);
      setIsShowInitialSupplyFormItem(_isShowInitialSupplyFormItem);
    },
    [formData, formValidateData, judgeIsShowInitialSupplyFormItem],
  );

  const getNewChains = useCallback(
    ({
      formKey,
      value,
      checked,
    }: {
      formKey: SelectChainFormKeys;
      value: TApplicationChainStatusItem;
      checked: boolean;
    }) => {
      const preChains = (formData[formKey] as TApplicationChainStatusItem[]) || [];
      let newChains: TApplicationChainStatusItem[] = [];
      if (checked) {
        newChains = [...preChains, value];
      } else {
        newChains = preChains.filter((v) => v.chainId !== value.chainId);
      }
      return newChains;
    },
    [formData],
  );

  const handleChainsChange = useCallback(
    ({ chain, checked }: { chain: TApplicationChainStatusItem; checked: boolean }) => {
      const newChains = getNewChains({
        formKey: SelectChainFormKeys.CHAINS,
        value: chain,
        checked,
      });

      handleFormDataChange({
        formKey: SelectChainFormKeys.CHAINS,
        value: newChains,
      });
    },
    [getNewChains, handleFormDataChange],
  );

  const handleInitialSupplyInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      const oldValue = formData[SelectChainFormKeys.INITIAL_SUPPLY];

      if (!value) return (e.target.value = '');

      const valueNotComma = parseWithStringCommas(value);
      const integerReg = /^[0-9]+$/;
      if (!integerReg.test(valueNotComma)) {
        return (e.target.value = oldValue);
      }

      return (e.target.value = formatWithCommas({ amount: valueNotComma }));
    },
    [formData],
  );

  const handleInitialSupplyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const valueNotComma = parseWithCommas(value);

      if (!valueNotComma) {
        handleFormDataChange({
          formKey: SelectChainFormKeys.INITIAL_SUPPLY,
          value: '',
          validateData: {
            validateStatus: FormValidateStatus.Error,
            errorMessage: REQUIRED_ERROR_MESSAGE,
          },
        });
      } else if (ZERO.plus(valueNotComma).lte(LANG_MAX)) {
        handleFormDataChange({
          formKey: SelectChainFormKeys.INITIAL_SUPPLY,
          value: valueNotComma,
          validateData: {
            validateStatus: FormValidateStatus.Normal,
            errorMessage: '',
          },
        });
      }
    },
    [handleFormDataChange],
  );

  const { unissuedChains, issuingChains, issuedChains } = useMemo(() => {
    const unissuedChains = formData[SelectChainFormKeys.CHAINS].filter(
      (chain) => chain.status === ApplicationChainStatusEnum.Unissued,
    );
    const issuingChains = formData[SelectChainFormKeys.CHAINS].filter(
      (chain) => chain.status === ApplicationChainStatusEnum.Issuing,
    );
    const issuedChains = {
      [SelectChainFormKeys.CHAINS]: formData[SelectChainFormKeys.CHAINS].filter(
        (chain) => chain.status === ApplicationChainStatusEnum.Issued,
      ),
    };
    return { unissuedChains, issuingChains, issuedChains };
  }, [formData]);

  const handleConnectWallets = useCallback(() => {
    connect();
  }, [connect]);

  const handleCreateToken = useCallback(() => {
    setCreationProgressModalProps({
      open: true,
      chains: [...unissuedChains, ...issuingChains],
    });
  }, [issuingChains, unissuedChains]);

  const handleAddChain = useCallback(
    async ({ errorChainIds }: { errorChainIds?: string[] } = {}) => {
      if (!token?.symbol) return;
      setGlobalLoading(true);
      try {
        const data = await addApplicationChain({
          chainIds: formData[SelectChainFormKeys.CHAINS]
            .filter((v) => !errorChainIds?.includes(v.chainId))
            .map((v) => v.chainId),
          symbol: token.symbol,
        });
        if (!data?.chainList) {
          throw new Error('Failed to add chain');
        }
        const networks = formData[SelectChainFormKeys.CHAINS]
          .filter((item) => data?.chainList?.some((v) => v.chainId === item.chainId))
          .map((v) => ({
            name: v.chainName,
          }));
        const networksString = JSON.stringify(networks);

        handleNextStep({ networks: networksString });
      } catch (error: any) {
        CommonMessage.error(handleListingErrorMessage(error));
      } finally {
        setGlobalLoading(false);
      }
    },
    [formData, handleNextStep, setGlobalLoading, token?.symbol],
  );

  const handleCreationProgressModalClose = useCallback(() => {
    setCreationProgressModalProps({
      open: false,
      chains: [],
    });
  }, []);

  const handleCreateFinish = useCallback(
    async ({ errorChainIds }: { errorChainIds?: string[] } = {}) => {
      handleCreationProgressModalClose();
      await handleAddChain({ errorChainIds });
    },
    [handleAddChain, handleCreationProgressModalClose],
  );

  const getActionButtonProps = useCallback(() => {
    let props: CommonButtonProps = {
      children: SELECT_CHAIN,
    };

    if (unissuedChains.length !== 0 || issuingChains.length !== 0) {
      if (unconnectedWallets.length !== 0 && !isButtonDisabled) {
        props = {
          children: `Connect ${unconnectedWallets.join(', ')} Wallet${unconnectedWallets.length > 1 ? 's' : ''}`,
          onClick: handleConnectWallets,
        };
      } else {
        props = {
          children: 'Create & Issue Token',
          onClick: handleCreateToken,
        };
      }
    } else if (Object.values(issuedChains).some((v) => v.length !== 0)) {
      props = {
        children: 'Submit',
        onClick: () => handleAddChain(),
      };
    }

    return props;
  }, [
    unissuedChains.length,
    issuingChains.length,
    issuedChains,
    unconnectedWallets,
    isButtonDisabled,
    handleConnectWallets,
    handleCreateToken,
    handleAddChain,
  ]);

  const init = useCallback(async () => {
    try {
      setGlobalLoading(true);
      await setAelfAuthFromStorage();
      await sleep(500);

      await getToken();
      await getChainList();
    } catch (error) {
      console.log('SelectChain init', error);
      handleBackStep();
    } finally {
      setGlobalLoading(false);
    }
  }, [getChainList, getToken, handleBackStep, setAelfAuthFromStorage, setGlobalLoading]);

  const connectAndInit = useCallback(() => {
    if (!isAelfConnected || !symbol) {
      handleBackStep();
    } else {
      init();
    }
  }, [handleBackStep, init, isAelfConnected, symbol]);
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
    setGlobalLoading(true);
    handleBackStep();
  }, [handleBackStep, setGlobalLoading]);
  const initLogoutRef = useRef(initForLogout);
  initLogoutRef.current = initForLogout;

  useEffectOnce(() => {
    // log out \ exit
    const { remove: removeLogoutSuccess } = eBridgeEventBus.AelfLogoutSuccess.addListener(() => {
      initLogoutRef.current();
    });

    return () => {
      removeLogoutSuccess();
    };
  });

  const renderChainsFormItem = useMemo(() => {
    return (
      <Form.Item label={SELECT_CHAIN_FORM_LABEL_MAP[SelectChainFormKeys.CHAINS]}>
        <Row gutter={[12, 8]}>
          {chainListData[SelectChainFormKeys.CHAINS].map((chain) => {
            const isDisabled = judgeIsChainDisabled(chain.status);

            const checked =
              isDisabled || formData[SelectChainFormKeys.CHAINS]?.some((v) => v.chainId === chain.chainId);

            let tooltip = '';
            if (isDisabled) {
              if (SELECT_CHAIN_FORM_CHAIN_LISTED_STATUS_LIST.includes(chain.status)) {
                tooltip = SELECT_CHAIN_FORM_CHAIN_TOOLTIP_MAP.LISTED;
              } else if (SELECT_CHAIN_FORM_CHAIN_CREATED_NOT_LISTED_STATUS_LIST.includes(chain.status)) {
                tooltip = SELECT_CHAIN_FORM_CHAIN_TOOLTIP_MAP.CREATED_NOT_LISTED.replace(
                  '{{chainName}}',
                  chain.chainName,
                );
              }
            }

            return (
              <Col key={chain.chainId} span={isMobile ? 24 : 8}>
                <CommonTooltipSwitchModal
                  ref={(ref) => {
                    tooltipSwitchModalsRef.current[chain.chainId] = ref;
                  }}
                  tip={tooltip}>
                  <div
                    className={clsx(
                      styles['select-chain-checkbox-item'],
                      checked && styles['select-chain-checkbox-item-checked'],
                      isDisabled && styles['select-chain-checkbox-item-disabled'],
                    )}
                    onClick={() => {
                      if (tooltip) {
                        tooltipSwitchModalsRef.current[chain.chainId]?.open();
                      }
                      handleChainsChange({
                        chain,
                        checked: !checked,
                      });
                    }}>
                    <div className={styles['select-chain-checkbox-content']}>
                      <IconFont type={chain.chainId ? getIconByAPIChainId(chain.chainId)?.type : ''} />
                      <span className={styles['select-chain-checkbox-label']}>{chain.chainName}</span>
                    </div>
                    <Checkbox value={chain.chainId} checked={checked} disabled={isDisabled} />
                  </div>
                </CommonTooltipSwitchModal>
              </Col>
            );
          })}
        </Row>
      </Form.Item>
    );
  }, [chainListData, formData, handleChainsChange, isMobile, judgeIsChainDisabled]);

  return (
    <>
      <div className={styles['select-chain']}>
        <div className={styles['select-chain-title-wrapper']}>
          <span className={styles['select-chain-title']}>{LISTING_STEP_ITEMS[ListingStep.SELECT_CHAIN].title}</span>
          <ListingTip
            title="Chain Guide"
            tip={
              <>
                <p className={clsx(!isMobile && 'font-15')}>Tips:</p>
                <ul className="list-style-decimal">
                  <li>Please select at least one chain.</li>
                  <li>
                    You can select multiple chains simultaneously, and Transfers will be supported between any two
                    selected chains.
                  </li>
                </ul>
              </>
            }
          />
        </div>
        {isAelfConnected ? (
          <>
            <Form className={styles['select-chain-form']} form={form} layout="vertical">
              <Form.Item label="Token">
                {token && (
                  <div className={styles['select-chain-token-row']}>
                    <TokenRow symbol={token.symbol} name={token.name} icon={token.icon} />
                  </div>
                )}
              </Form.Item>
              {renderChainsFormItem}
              {isShowInitialSupplyFormItem && (
                <Form.Item
                  validateStatus={formValidateData[SelectChainFormKeys.INITIAL_SUPPLY].validateStatus}
                  help={formValidateData[SelectChainFormKeys.INITIAL_SUPPLY].errorMessage}
                  label={
                    <div className={styles['select-chain-initial-supply-label-wrapper']}>
                      <span className={styles['select-chain-label']}>
                        {SELECT_CHAIN_FORM_LABEL_MAP[SelectChainFormKeys.INITIAL_SUPPLY]}
                      </span>
                      <div className={styles['select-chain-description']}>
                        <p>
                          {`The token information on ${formatListWithAnd(
                            formData[SelectChainFormKeys.CHAINS].map((v) => v.chainName),
                          )} is the same as that on the aelf chain.`}
                        </p>
                        <p>{'You only need to fill in the issuance amount of the token on the chains.'}</p>
                      </div>
                    </div>
                  }>
                  <Input
                    id="initialSupplyInput"
                    autoComplete="off"
                    allowClear
                    placeholder={SELECT_CHAIN_FORM_PLACEHOLDER_MAP[SelectChainFormKeys.INITIAL_SUPPLY]}
                    value={formData[SelectChainFormKeys.INITIAL_SUPPLY]}
                    onInput={handleInitialSupplyInput}
                    onChange={handleInitialSupplyChange}
                    onFocus={() => handleInputFocus('initialSupplyInput')}
                  />
                </Form.Item>
              )}
            </Form>
            <div className={styles['select-chain-footer']}>
              <CommonButton className={styles['select-chain-footer-button']} onClick={handleBackStep}>
                {BUTTON_TEXT_BACK}
              </CommonButton>
              <CommonButton
                {...getActionButtonProps()}
                className={styles['select-chain-footer-button']}
                type="primary"
                disabled={isButtonDisabled}
              />
            </div>
          </>
        ) : (
          <EmptyDataBox text={WALLET_CONNECTION_REQUIRED} />
        )}
      </div>
      <CreationProgressModal
        {...creationProgressModalProps}
        isFirstTimeCreation={!hasDisabledChain}
        isSelectAelfChains={false} // TODO
        supply={formData[SelectChainFormKeys.INITIAL_SUPPLY]}
        handleCreateFinish={handleCreateFinish}
        handleClose={handleCreationProgressModalClose}
      />
    </>
  );
}
