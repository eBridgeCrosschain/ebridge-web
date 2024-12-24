import { useCallback, useMemo, useRef, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { Form, Input, InputProps } from 'antd';
import { useRouter } from 'next/router';
import ConnectWallet from 'components/ConnectWallet';
import CommonButton from 'components/CommonButton';
import CommonMessage from 'components/CommonMessage';
import ListingTip from '../ListingTip';
import TokenSelect from './TokenSelect';
import {
  commitTokenInfo,
  getApplicationTokenInfo,
  getApplicationTokenList,
  getApplicationTokenConfig,
} from 'utils/api/application';
import { getListingUrl } from 'utils/listingApplication';
import { getChainType } from 'utils/chain';
import { useAElf } from 'hooks/web3';
// import { useConnect } from 'hooks/useConnect';
import { useMobile } from 'contexts/useStore/hooks';
import { TCommitTokenInfoRequest } from 'types/api';
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

interface ITokenInformationProps {
  symbol?: string;
  handleNextStep: (params?: TSearchParams) => void;
}

const AELF_CHAIN_ID = MAIN_SIDE_CHAIN_ID.mainChain;

export default function TokenInformation({ symbol, handleNextStep }: ITokenInformationProps) {
  const isMobile = useMobile();
  const router = useRouter();
  // const { setLoading } = useLoading(); // TODO: page loading
  const [form] = Form.useForm<TTokenInformationFormValues>();
  // const connect = useConnect();
  const chainType = getChainType(AELF_CHAIN_ID);
  const { account } = useAElf();
  const isConnected = useMemo(() => !!account, [account]);

  const [formValues, setFormValues] = useState(TOKEN_INFORMATION_FORM_INITIAL_VALUES);
  const [formValidateData, setFormValidateData] = useState(TOKEN_INFORMATION_FORM_INITIAL_VALIDATE_DATA);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [tokenList, setTokenList] = useState<TTokenItem[]>([]);
  const [tokenConfig, setTokenConfig] = useState<TTokenConfig | undefined>();
  const [isActionButtonLoading, setIsActionButtonLoading] = useState(false);

  const judgeIsButtonDisabled = useCallback(
    (
      currentFormData: Partial<TTokenInformationFormValues>,
      currentFormValidateData: TTokenInformationFormValidateData,
      currentTokenConfig?: TTokenConfig,
    ) => {
      const token = currentFormData[TokenInformationFormKeys.TOKEN];
      const isTokenValid =
        !!token?.liquidityInUsd &&
        !!currentTokenConfig?.liquidityInUsd &&
        parseFloat(token.liquidityInUsd) > parseFloat(currentTokenConfig.liquidityInUsd) &&
        currentTokenConfig?.holders !== undefined &&
        token.holders > currentTokenConfig.holders;

      const isDisabled =
        Object.values(currentFormData).some((item) => !item) ||
        Object.values(currentFormValidateData).some((item) => item.validateStatus === FormValidateStatus.Error) ||
        !isTokenValid;
      setIsButtonDisabled(isDisabled);
    },
    [],
  );

  // const reset = useCallback(() => {
  //   setFormValues(TOKEN_INFORMATION_FORM_INITIAL_VALUES);
  //   setFormValidateData(TOKEN_INFORMATION_FORM_INITIAL_VALIDATE_DATA);
  //   setIsButtonDisabled(true);
  //   setTokenList([]);
  // }, []);

  const getTokenList = useCallback(async () => {
    try {
      // await setAelfAuthFromStorage();
      // await sleep(500);
      const res = await getApplicationTokenList();
      const list = (res.tokenList || []).map((item) => ({
        name: item.tokenName,
        symbol: item.symbol,
        icon: item.tokenImage,
        liquidityInUsd: item.liquidityInUsd,
        holders: item.holders,
      }));
      setTokenList(list);
      return list;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

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

  const getTokenInfo = useCallback(
    async (_symbol: string, _tokenList: TTokenItem[], _tokenConfig: TTokenConfig) => {
      try {
        const res = await getApplicationTokenInfo({ symbol: _symbol });
        const token = _tokenList.find((item) => item.symbol === _symbol);
        if (token) {
          const newFormValues = {
            ...TOKEN_INFORMATION_FORM_INITIAL_VALUES,
            [TokenInformationFormKeys.TOKEN]: token,
          };
          if (res) {
            newFormValues[TokenInformationFormKeys.OFFICIAL_WEBSITE] = res.officialWebsite;
            newFormValues[TokenInformationFormKeys.OFFICIAL_TWITTER] = res.officialTwitter;
            newFormValues[TokenInformationFormKeys.TITLE] = res.title;
            newFormValues[TokenInformationFormKeys.PERSON_NAME] = res.personName;
            newFormValues[TokenInformationFormKeys.TELEGRAM_HANDLER] = res.telegramHandler;
            newFormValues[TokenInformationFormKeys.EMAIL] = res.email;
          }
          const newFormValidateData = {
            ...TOKEN_INFORMATION_FORM_INITIAL_VALIDATE_DATA,
            [TokenInformationFormKeys.TOKEN]: formValidateData[TokenInformationFormKeys.TOKEN],
          };
          setFormValues(newFormValues);
          setFormValidateData(newFormValidateData);
          judgeIsButtonDisabled(newFormValues, newFormValidateData, _tokenConfig);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [formValidateData, judgeIsButtonDisabled],
  );

  const init = useCallback(async () => {
    // setLoading(true);
    const list = await getTokenList();
    if (symbol) {
      const config = await getTokenConfig(symbol);
      if (config) {
        await getTokenInfo(symbol, list, config);
      }
    }
    // setLoading(false);
  }, [getTokenConfig, getTokenInfo, getTokenList, symbol]);
  const initRef = useRef(init);
  initRef.current = init;

  const connectAndInit = useCallback(() => {
    if (!isConnected) {
      // TODO: connect aelf wallet
      // handleAelfLogin(true, initRef.current);
    } else {
      initRef.current();
    }
  }, [isConnected]);
  const connectAndInitRef = useRef(connectAndInit);
  connectAndInitRef.current = connectAndInit;
  const connectAndInitSleep = useCallback(async () => {
    // setLoading(true);
    // Delay 3s to determine the login status, because the login data is acquired slowly, to prevent the login pop-up window from being displayed first and then automatically logging in successfully later.
    // await sleep(3000);
    connectAndInitRef.current();
  }, []);
  useEffectOnce(() => {
    connectAndInitSleep();
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
      // setLoading(true);
      const list = await getTokenList();
      const newItem = list.find((v) => v.symbol === item.symbol);
      if (newItem) {
        handleFormDataChange({
          formKey: TokenInformationFormKeys.TOKEN,
          value: newItem,
          validateData: {
            validateStatus: FormValidateStatus.Normal,
            errorMessage: '',
          },
        });
        router.replace(getListingUrl(ListingStep.TOKEN_INFORMATION, { symbol: item.symbol }));
        const config = await getTokenConfig(item.symbol);
        if (config) {
          await getTokenInfo(item.symbol, list, config);
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
      // setLoading(false);
    },
    [handleFormDataChange, router, getTokenConfig, getTokenInfo, getTokenList],
  );

  const handleCommonInputChange = useCallback(
    (value: string, key: TokenInformationFormKeys) => {
      if (!value) {
        handleFormDataChange({
          formKey: key,
          value: value,
          validateData: {
            validateStatus: FormValidateStatus.Error,
            errorMessage: REQUIRED_ERROR_MESSAGE,
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

  const handleUrlChange = useCallback(
    (value: string, key: TokenInformationFormKeys) => {
      if (!value) {
        handleFormDataChange({
          formKey: key,
          value: value,
          validateData: {
            validateStatus: FormValidateStatus.Error,
            errorMessage: REQUIRED_ERROR_MESSAGE,
          },
        });
      } else if (!value.startsWith('https://')) {
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

  const handleSubmit = async () => {
    setIsActionButtonLoading(true);
    const params = {
      symbol: formValues[TokenInformationFormKeys.TOKEN]?.symbol,
      officialWebsite: formValues[TokenInformationFormKeys.OFFICIAL_WEBSITE],
      officialTwitter: formValues[TokenInformationFormKeys.OFFICIAL_TWITTER],
      title: formValues[TokenInformationFormKeys.TITLE],
      personName: formValues[TokenInformationFormKeys.PERSON_NAME],
      telegramHandler: formValues[TokenInformationFormKeys.TELEGRAM_HANDLER],
      email: formValues[TokenInformationFormKeys.EMAIL],
    } as TCommitTokenInfoRequest;
    try {
      const isSuccess = await commitTokenInfo(params);
      if (isSuccess) {
        handleNextStep({ symbol: params.symbol });
      }
    } catch (error: any) {
      CommonMessage.error(error.message);
    } finally {
      setIsActionButtonLoading(false);
    }
  };

  const getCommonFormItemProps = (key: TokenInformationFormKeys) => ({
    validateStatus: formValidateData[key].validateStatus,
    help: formValidateData[key].errorMessage,
  });

  const getCommonInputProps = (key: TokenInformationFormKeys): Partial<InputProps> => ({
    size: 'large',
    allowClear: true,
    autoComplete: 'off',
    placeholder: TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP[key],
    value: formValues[key] as string,
  });

  const renderTokenRequirements = () => {
    const requirements = [];
    if (tokenConfig?.liquidityInUsd && parseFloat(tokenConfig.liquidityInUsd) > 0) {
      requirements.push(`Liquidity > $${tokenConfig.liquidityInUsd}`);
    }
    if (tokenConfig?.holders) {
      requirements.push(`Holders > ${tokenConfig.holders}`);
    }
    return requirements.map((requirement, index) => (
      <p key={index}>{`${!isMobile ? `${index + 1}. ` : ''}${requirement}`}</p>
    ));
  };

  return (
    <div className={styles['token-information']}>
      <div className={styles['token-information-title-wrapper']}>
        <span className={styles['token-information-title']}>
          {LISTING_STEP_ITEMS[ListingStep.TOKEN_INFORMATION].title}
        </span>
        {((tokenConfig?.liquidityInUsd && parseFloat(tokenConfig.liquidityInUsd) > 0) || !!tokenConfig?.holders) && (
          <ListingTip
            title="Token Requirements"
            tip={
              <>
                <p>The token must meet the requirements of:</p>
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
                chainType={chainType}
                chainId={AELF_CHAIN_ID}
                account={account}
                buttonText={CONNECT_AELF_WALLET}
              />
            </div>
          }>
          <TokenSelect
            tokenConfig={tokenConfig}
            tokenList={tokenList}
            token={formValues[TokenInformationFormKeys.TOKEN]}
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
        {isConnected ? (
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
            // TODO: connect aelf wallet
            // onClick={() => connect(chainType, MAIN_SIDE_CHAIN_ID.mainChain)}
          >
            {CONNECT_AELF_WALLET}
          </CommonButton>
        )}
      </div>
    </div>
  );
}
