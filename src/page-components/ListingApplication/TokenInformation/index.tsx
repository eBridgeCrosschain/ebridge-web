import { useCallback, useMemo, useRef, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import { Form, Input, InputProps } from 'antd';
import ConnectWallet from 'components/ConnectWallet';
import CommonButton from 'components/CommonButton';
import CommonMessage from 'components/CommonMessage';
import ListingTip from '../ListingTip';
import TokenSelect from './TokenSelect';
import { sleep } from 'utils';
import {
  commitTokenInfo,
  getApplicationTokenInfo,
  getApplicationTokenList,
  getApplicationTokenConfig,
  getApplicationTokenDetail,
} from 'utils/api/application';
import { getListingUrl } from 'utils/listingApplication';
import { getChainType } from 'utils/chain';
import eBridgeEventBus from 'utils/eBridgeEventBus';
import { handleInputFocus } from 'utils/input';
import { handleListingErrorMessage } from 'utils/error';
import { useAElf } from 'hooks/web3';
import { useAelfLogin } from 'hooks/wallet';
import { useSetAelfAuthFromStorage } from 'hooks/aelfAuthToken';
import useGlobalLoading from 'hooks/useGlobalLoading';
import { useMobile } from 'contexts/useStore/hooks';
import { TCommitTokenInfoRequest, TGetApplicationTokenInfoResult } from 'types/api';
import {
  TTokenInformationFormValues,
  TokenInformationFormKeys,
  TTokenInformationFormValidateData,
  FormValidateStatus,
  TTokenItem,
  TSearchParams,
  TTokenConfig,
} from 'types/listingApplication';
import {
  TOKEN_INFORMATION_FORM_LABEL_MAP,
  TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP,
  TOKEN_INFORMATION_FORM_INITIAL_VALIDATE_DATA,
  TOKEN_INFORMATION_FORM_INITIAL_VALUES,
  REQUIRED_ERROR_MESSAGE,
  ListingStep,
  LISTING_STEP_ITEMS,
} from 'constants/listingApplication';
import { CONNECT_AELF_WALLET, BUTTON_TEXT_NEXT } from 'constants/misc';
import { MAIN_SIDE_CHAIN_ID } from 'constants/index';
import styles from './styles.module.less';
import { useWallet } from 'contexts/useWallet/hooks';
import { isELFChain } from 'utils/aelfUtils';

interface ITokenInformationProps {
  symbol?: string;
  handleNextStep: (params?: TSearchParams) => void;
}

const AELF_CHAIN_ID = MAIN_SIDE_CHAIN_ID.mainChain;

export default function TokenInformation({ symbol, handleNextStep }: ITokenInformationProps) {
  const isMobile = useMobile();
  const router = useRouter();
  const setAelfAuthFromStorage = useSetAelfAuthFromStorage();
  const handleAelfLogin = useAelfLogin();
  const { setGlobalLoading } = useGlobalLoading();
  const [form] = Form.useForm<TTokenInformationFormValues>();
  const aelfWallet = useAElf();
  const { isActive: isAelfActive, account: aelfAccount } = aelfWallet || {};
  const { fromWallet, fromOptions, toWallet, toOptions } = useWallet();

  const currentChain = useMemo(() => {
    const fromChainId = fromWallet?.chainId;
    const toChainId = toWallet?.chainId;

    if (isELFChain(fromChainId)) return { chainId: fromChainId, chainType: fromOptions?.chainType };
    if (isELFChain(toChainId)) return { chainId: toChainId, chainType: toOptions?.chainType };
    return { chainId: AELF_CHAIN_ID, chainType: getChainType(AELF_CHAIN_ID) };
  }, [fromOptions?.chainType, fromWallet?.chainId, toOptions?.chainType, toWallet?.chainId]);

  const [formValues, setFormValues] = useState(TOKEN_INFORMATION_FORM_INITIAL_VALUES);
  const [formValidateData, setFormValidateData] = useState(TOKEN_INFORMATION_FORM_INITIAL_VALIDATE_DATA);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [tokenList, setTokenList] = useState<TTokenItem[]>([]);
  const [liquidityInUsd, setLiquidityInUsd] = useState<string>();
  const [holders, setHolders] = useState<number>();
  const liquidityInUsdRef = useRef<string>();
  const holdersRef = useRef<number>();
  const [tokenConfig, setTokenConfig] = useState<TTokenConfig | undefined>();
  const currentTokenInfoRef = useRef<TGetApplicationTokenInfoResult>();
  const [isActionButtonLoading, setIsActionButtonLoading] = useState(false);

  const judgeIsButtonDisabled = useCallback(
    (
      currentFormData: Partial<TTokenInformationFormValues>,
      currentFormValidateData: TTokenInformationFormValidateData,
      currentTokenConfig?: TTokenConfig,
    ) => {
      const isTokenValid =
        !!liquidityInUsdRef.current &&
        !!currentTokenConfig?.liquidityInUsd &&
        parseFloat(liquidityInUsdRef.current) > parseFloat(currentTokenConfig.liquidityInUsd) &&
        holdersRef.current !== undefined &&
        currentTokenConfig?.holders !== undefined &&
        holdersRef.current > currentTokenConfig.holders;
      const emailValid = !!currentFormData[TokenInformationFormKeys.EMAIL];
      const isDisabled =
        Object.values(currentFormValidateData).some((item) => item.validateStatus === FormValidateStatus.Error) ||
        !isTokenValid ||
        !emailValid;
      setIsButtonDisabled(isDisabled);
    },
    [],
  );

  const reset = useCallback(() => {
    setFormValues(TOKEN_INFORMATION_FORM_INITIAL_VALUES);
    setFormValidateData(TOKEN_INFORMATION_FORM_INITIAL_VALIDATE_DATA);
    setIsButtonDisabled(true);
    setTokenList([]);
  }, []);

  const getTokenList = useCallback(async () => {
    try {
      await setAelfAuthFromStorage();
      await sleep(500);
      const res = await getApplicationTokenList({});
      const list = (res.tokenList || []).map((item) => ({
        name: item.tokenName,
        symbol: item.symbol,
        icon: item.tokenImage,
        status: item.status,
        totalSupply: item.totalSupply,
      }));
      setTokenList(list);
      return list;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [setAelfAuthFromStorage]);

  const getTokenConfig = useCallback(async (_symbol: string) => {
    try {
      const config = await getApplicationTokenConfig({ symbol: _symbol });
      setTokenConfig(config);
      return config;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }, []);

  const getTokenDetail = useCallback(async (symbol: string) => {
    try {
      const _tokenDetail = await getApplicationTokenDetail({ symbol: symbol });
      setLiquidityInUsd(_tokenDetail.liquidityInUsd);
      liquidityInUsdRef.current = _tokenDetail.liquidityInUsd;
      setHolders(_tokenDetail.holders);
      holdersRef.current = _tokenDetail.holders;
    } catch (error) {
      console.log('getApplicationTokenDetail error', error);
    }
  }, []);

  const getTokenInfo = useCallback(
    async (_symbol: string, _tokenList: TTokenItem[], _tokenConfig: TTokenConfig) => {
      const token = _tokenList.find((item) => item.symbol === _symbol);
      const newFormValues = {
        ...TOKEN_INFORMATION_FORM_INITIAL_VALUES,
        [TokenInformationFormKeys.TOKEN]: token,
      };
      const newFormValidateData = TOKEN_INFORMATION_FORM_INITIAL_VALIDATE_DATA;

      await getTokenDetail(_symbol);

      try {
        const res = await getApplicationTokenInfo({ symbol: _symbol });
        if (token && res && res.symbol) {
          currentTokenInfoRef.current = res;
          newFormValues[TokenInformationFormKeys.OFFICIAL_WEBSITE] = res.officialWebsite;
          newFormValues[TokenInformationFormKeys.OFFICIAL_TWITTER] = res.officialTwitter;
          newFormValues[TokenInformationFormKeys.TITLE] = res.title;
          newFormValues[TokenInformationFormKeys.PERSON_NAME] = res.personName;
          newFormValues[TokenInformationFormKeys.TELEGRAM_HANDLER] = res.telegramHandler;
          newFormValues[TokenInformationFormKeys.EMAIL] = res.email;
        }
      } catch (error) {
        console.error(error);
        currentTokenInfoRef.current = undefined;
      } finally {
        setFormValues(newFormValues);
        setFormValidateData(newFormValidateData);
        judgeIsButtonDisabled(newFormValues, newFormValidateData, _tokenConfig);
      }
    },
    [getTokenDetail, judgeIsButtonDisabled],
  );

  const init = useCallback(async () => {
    setGlobalLoading(true);
    const list = await getTokenList();
    if (symbol) {
      const config = await getTokenConfig(symbol);
      if (config) {
        await getTokenInfo(symbol, list, config);
      }
    }
    setGlobalLoading(false);
  }, [getTokenConfig, getTokenInfo, getTokenList, setGlobalLoading, symbol]);
  const initRef = useRef(init);
  initRef.current = init;

  const connectAndInit = useCallback(() => {
    if (!isAelfActive) {
      handleAelfLogin(true, initRef.current, true);
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
    reset();
  }, [reset]);
  const initLogoutRef = useRef(initForLogout);
  initLogoutRef.current = initForLogout;

  const initForReLogin = useCallback(async () => {
    initRef.current();
  }, []);
  const initForReLoginRef = useRef(initForReLogin);
  initForReLoginRef.current = initForReLogin;

  useEffectOnce(() => {
    // log in
    const { remove: removeLoginSuccess } = eBridgeEventBus.AelfLoginSuccess.addListener(() => {
      initForReLoginRef.current();
    });
    // log out \ exit
    const { remove: removeLogoutSuccess } = eBridgeEventBus.AelfLogoutSuccess.addListener(() => {
      initLogoutRef.current();
    });

    return () => {
      removeLoginSuccess();
      removeLogoutSuccess();
    };
  });

  const handleFormDataChange = useCallback(
    ({
      formKey,
      value,
      validateData,
    }: {
      formKey: TokenInformationFormKeys;
      value?: TTokenInformationFormValues[TokenInformationFormKeys];
      validateData: TTokenInformationFormValidateData[TokenInformationFormKeys];
    }) => {
      const newFormValues = { ...formValues, [formKey]: value };
      const newFormValidateData = {
        ...formValidateData,
        [formKey]: validateData,
      };
      setFormValues(newFormValues);
      setFormValidateData(newFormValidateData);
      judgeIsButtonDisabled(newFormValues, newFormValidateData, tokenConfig);
    },
    [formValidateData, formValues, judgeIsButtonDisabled, tokenConfig],
  );

  const handleSelectToken = useCallback(
    async (item: TTokenItem) => {
      setGlobalLoading(true);
      // Re-obtain the token list data by switching tokens, so that users can see the latest operable tokens.
      const list = await getTokenList();
      const currentList = list.length > 0 ? list : tokenList;
      const newItem = currentList.find((v) => v.symbol === item.symbol);
      if (newItem) {
        handleFormDataChange({
          formKey: TokenInformationFormKeys.TOKEN,
          value: newItem,
          validateData: {
            validateStatus: FormValidateStatus.Normal,
            errorMessage: '',
          },
        });
        router.replace(getListingUrl(ListingStep.TOKEN_INFORMATION, { symbol: newItem.symbol }));
        const config = await getTokenConfig(newItem.symbol);
        if (config) {
          await getTokenInfo(newItem.symbol, currentList, config);
        }
      } else {
        handleFormDataChange({
          formKey: TokenInformationFormKeys.TOKEN,
          value: undefined,
          validateData: {
            validateStatus: FormValidateStatus.Error,
            errorMessage: REQUIRED_ERROR_MESSAGE,
          },
        });
      }
      setTokenList(currentList);
      setGlobalLoading(false);
    },
    [setGlobalLoading, getTokenList, tokenList, handleFormDataChange, router, getTokenConfig, getTokenInfo],
  );

  const handleCommonInputChange = useCallback(
    (value: string, key: TokenInformationFormKeys) => {
      handleFormDataChange({
        formKey: key,
        value: value,
        validateData: {
          validateStatus: FormValidateStatus.Normal,
          errorMessage: '',
        },
      });
    },
    [handleFormDataChange],
  );

  const handleUrlChange = useCallback(
    (value: string, key: TokenInformationFormKeys) => {
      if (value && !value.startsWith('https://')) {
        handleFormDataChange({
          formKey: key,
          value: value,
          validateData: {
            validateStatus: FormValidateStatus.Error,
            errorMessage: 'Please enter a valid URL',
          },
        });
      } else {
        handleFormDataChange({
          formKey: key,
          value: value,
          validateData: {
            validateStatus: FormValidateStatus.Normal,
            errorMessage: '',
          },
        });
      }
    },
    [handleFormDataChange],
  );

  const handleEmailChange = useCallback(
    (value: string) => {
      if (!value) {
        handleFormDataChange({
          formKey: TokenInformationFormKeys.EMAIL,
          value: value,
          validateData: {
            validateStatus: FormValidateStatus.Error,
            errorMessage: REQUIRED_ERROR_MESSAGE,
          },
        });
      } else if (!value.includes('@')) {
        handleFormDataChange({
          formKey: TokenInformationFormKeys.EMAIL,
          value: value,
          validateData: {
            validateStatus: FormValidateStatus.Error,
            errorMessage: 'Please enter a valid email address',
          },
        });
      } else {
        handleFormDataChange({
          formKey: TokenInformationFormKeys.EMAIL,
          value: value,
          validateData: {
            validateStatus: FormValidateStatus.Normal,
            errorMessage: '',
          },
        });
      }
    },
    [handleFormDataChange],
  );

  const checkFormChange = useCallback((params: TCommitTokenInfoRequest) => {
    return (
      params.symbol === currentTokenInfoRef.current?.symbol &&
      params.officialWebsite === currentTokenInfoRef.current?.officialWebsite &&
      params.officialTwitter === currentTokenInfoRef.current?.officialTwitter &&
      params.title === currentTokenInfoRef.current?.title &&
      params.personName === currentTokenInfoRef.current?.personName &&
      params.telegramHandler === currentTokenInfoRef.current?.telegramHandler &&
      params.email === currentTokenInfoRef.current?.email
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formValues[TokenInformationFormKeys.TOKEN]?.symbol || !formValues[TokenInformationFormKeys.EMAIL]) return;

    setIsActionButtonLoading(true);
    const params: TCommitTokenInfoRequest = {
      symbol: formValues[TokenInformationFormKeys.TOKEN]?.symbol,
      officialWebsite: formValues[TokenInformationFormKeys.OFFICIAL_WEBSITE],
      officialTwitter: formValues[TokenInformationFormKeys.OFFICIAL_TWITTER],
      title: formValues[TokenInformationFormKeys.TITLE],
      personName: formValues[TokenInformationFormKeys.PERSON_NAME],
      telegramHandler: formValues[TokenInformationFormKeys.TELEGRAM_HANDLER],
      email: formValues[TokenInformationFormKeys.EMAIL],
    };

    if (checkFormChange(params)) {
      handleNextStep({ symbol: params.symbol });
      setIsActionButtonLoading(false);
    } else {
      try {
        const isSuccess = await commitTokenInfo(params);
        if (isSuccess) {
          handleNextStep({ symbol: params.symbol });
        }
      } catch (error: any) {
        CommonMessage.error(handleListingErrorMessage(error));
      } finally {
        setIsActionButtonLoading(false);
      }
    }
  }, [checkFormChange, formValues, handleNextStep]);

  const getCommonFormItemProps = useCallback(
    (key: TokenInformationFormKeys) => ({
      validateStatus: formValidateData[key].validateStatus,
      help: formValidateData[key].errorMessage,
    }),
    [formValidateData],
  );

  const getCommonInputProps = useCallback(
    (key: TokenInformationFormKeys): Partial<InputProps> => {
      const id = `tokenInformationInput_${key}`;
      return {
        size: 'large',
        allowClear: true,
        autoComplete: 'off',
        placeholder: TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP[key],
        value: formValues[key] as string,
        id,
        onFocus: () => handleInputFocus(id),
      };
    },
    [formValues],
  );

  const renderTokenRequirements = useCallback(() => {
    const requirements = [];
    if (tokenConfig?.liquidityInUsd) {
      requirements.push(`Liquidity > $${tokenConfig.liquidityInUsd}`);
    }
    if (tokenConfig?.holders) {
      requirements.push(`Holders > ${tokenConfig.holders}`);
    }
    return requirements.map((requirement, index) => (
      <p key={index}>{`${!isMobile ? `${index + 1}. ` : ''}${requirement}`}</p>
    ));
  }, [isMobile, tokenConfig?.holders, tokenConfig?.liquidityInUsd]);

  return (
    <div className={styles['token-information']}>
      <div className={styles['token-information-title-wrapper']}>
        <span className={styles['token-information-title']}>
          {LISTING_STEP_ITEMS[ListingStep.TOKEN_INFORMATION].title}
        </span>
        {(tokenConfig?.liquidityInUsd || tokenConfig?.holders) && (
          <ListingTip
            title="Token Requirements"
            tip={
              <>
                <p className={clsx(!isMobile && 'font-15')}>The token must meet the requirements of:</p>
                {renderTokenRequirements()}
              </>
            }
          />
        )}
      </div>
      <Form className={styles['token-information-form']} form={form} layout="vertical">
        <Form.Item
          {...getCommonFormItemProps(TokenInformationFormKeys.TOKEN)}
          label={
            <div className={styles['token-information-form-label-wrapper']}>
              <span className={styles['token-information-form-label']}>
                {TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.TOKEN]}
              </span>
              <ConnectWallet
                chainType={currentChain.chainType}
                chainId={currentChain.chainId}
                account={aelfAccount}
                buttonText={CONNECT_AELF_WALLET}
              />
            </div>
          }>
          <TokenSelect
            tokenConfig={tokenConfig}
            tokenList={tokenList}
            token={formValues[TokenInformationFormKeys.TOKEN]}
            liquidityInUsd={liquidityInUsd}
            holders={holders}
            placeholder={TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP[TokenInformationFormKeys.TOKEN]}
            selectCallback={handleSelectToken}
          />
        </Form.Item>
        <Form.Item
          {...getCommonFormItemProps(TokenInformationFormKeys.OFFICIAL_WEBSITE)}
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.OFFICIAL_WEBSITE]}>
          <Input
            {...getCommonInputProps(TokenInformationFormKeys.OFFICIAL_WEBSITE)}
            onChange={(e) => handleUrlChange(e.target.value, TokenInformationFormKeys.OFFICIAL_WEBSITE)}
          />
        </Form.Item>
        <Form.Item
          {...getCommonFormItemProps(TokenInformationFormKeys.OFFICIAL_TWITTER)}
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.OFFICIAL_TWITTER]}>
          <Input
            {...getCommonInputProps(TokenInformationFormKeys.OFFICIAL_TWITTER)}
            onChange={(e) => handleUrlChange(e.target.value, TokenInformationFormKeys.OFFICIAL_TWITTER)}
          />
        </Form.Item>
        <Form.Item
          {...getCommonFormItemProps(TokenInformationFormKeys.TITLE)}
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.TITLE]}>
          <Input
            {...getCommonInputProps(TokenInformationFormKeys.TITLE)}
            onChange={(e) => handleCommonInputChange(e.target.value, TokenInformationFormKeys.TITLE)}
          />
        </Form.Item>
        <Form.Item
          {...getCommonFormItemProps(TokenInformationFormKeys.PERSON_NAME)}
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.PERSON_NAME]}>
          <Input
            {...getCommonInputProps(TokenInformationFormKeys.PERSON_NAME)}
            onChange={(e) => handleCommonInputChange(e.target.value, TokenInformationFormKeys.PERSON_NAME)}
          />
        </Form.Item>
        <Form.Item
          {...getCommonFormItemProps(TokenInformationFormKeys.TELEGRAM_HANDLER)}
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.TELEGRAM_HANDLER]}>
          <Input
            {...getCommonInputProps(TokenInformationFormKeys.TELEGRAM_HANDLER)}
            onChange={(e) => handleCommonInputChange(e.target.value, TokenInformationFormKeys.TELEGRAM_HANDLER)}
          />
        </Form.Item>
        <Form.Item
          {...getCommonFormItemProps(TokenInformationFormKeys.EMAIL)}
          label={TOKEN_INFORMATION_FORM_LABEL_MAP[TokenInformationFormKeys.EMAIL]}>
          <Input
            {...getCommonInputProps(TokenInformationFormKeys.EMAIL)}
            onChange={(e) => handleEmailChange(e.target.value)}
          />
        </Form.Item>
      </Form>
      <div className={styles['token-information-footer-button-wrapper']}>
        {isAelfActive ? (
          <CommonButton
            className={styles['token-information-footer-button']}
            type="primary"
            disabled={isButtonDisabled}
            loading={isActionButtonLoading}
            onClick={handleSubmit}>
            {!isActionButtonLoading && BUTTON_TEXT_NEXT}
          </CommonButton>
        ) : (
          <CommonButton
            className={styles['token-information-footer-button']}
            type="primary"
            onClick={() => handleAelfLogin(true, initRef.current)}>
            {CONNECT_AELF_WALLET}
          </CommonButton>
        )}
      </div>
    </div>
  );
}
