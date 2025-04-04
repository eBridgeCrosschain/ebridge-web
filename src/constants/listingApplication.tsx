import { ICommonStepsProps } from 'components/CommonSteps';
import { ApplicationChainStatusEnum } from 'types/api';
import {
  TokenInformationFormKeys,
  SelectChainFormKeys,
  TTokenInformationFormValidateData,
  FormValidateStatus,
  TTokenInformationFormValues,
  TSelectChainFormValues,
  TSelectChainFormValidateData,
  TChains,
} from 'types/listingApplication';

export const BRIDGE_NOW = 'Bridge Now';

export const VIEW_PROGRESS = 'View Progress';

export const MY_APPLICATIONS = 'My Applications';

export const NO_APPLICATION = 'No application';

export const WALLET_CONNECTION_REQUIRED = 'Wallet connection required';

export enum ListingStep {
  TOKEN_INFORMATION = 0,
  SELECT_CHAIN = 1,
  INITIALIZE_TOKEN_POOL = 2,
}

export const LISTING_STEP_PATHNAME_MAP: Record<ListingStep, string> = {
  [ListingStep.TOKEN_INFORMATION]: '/token-information',
  [ListingStep.SELECT_CHAIN]: '/select-chain',
  [ListingStep.INITIALIZE_TOKEN_POOL]: '/initialize-token-pool',
};

export const LISTING_STEP_ITEMS: ICommonStepsProps['stepItems'] = [
  {
    title: 'Token Information',
  },
  {
    title: 'Select Chain',
  },
  {
    title: 'Initialize Token Pool',
  },
];

export enum ListingProcessStep {
  BASIC_INFO = 0,
  SELECT_CHAIN = 1,
  INITIALIZE_TOKEN_POOL = 2,
  COMPLETE = 3,
}

export const VIEW_PROGRESS_STEPS: ICommonStepsProps['stepItems'] = [
  {
    title: 'Basic info',
  },
  {
    title: 'Select chain',
  },
  {
    title: 'Initialize Token Pool',
    description: 'It is expected to be completed in 1 business day.',
  },
  {
    title: 'Complete',
  },
];

// ================ Token information ================

export const TOKEN_INFORMATION_FORM_LABEL_MAP: Record<TokenInformationFormKeys, string> = {
  [TokenInformationFormKeys.TOKEN]: 'Select token',
  [TokenInformationFormKeys.OFFICIAL_WEBSITE]: 'Official website (Optional)',
  [TokenInformationFormKeys.OFFICIAL_TWITTER]: 'Official Twitter (Optional)',
  [TokenInformationFormKeys.TITLE]: 'What is your title on the project/team/company? (Optional)',
  [TokenInformationFormKeys.PERSON_NAME]: 'Contact person name (Optional)',
  [TokenInformationFormKeys.TELEGRAM_HANDLER]: 'Your Telegram handle (Optional)',
  [TokenInformationFormKeys.EMAIL]: 'Contact E-mail',
};

export const TOKEN_INFORMATION_FORM_PLACEHOLDER_MAP: Record<TokenInformationFormKeys, string> = {
  [TokenInformationFormKeys.TOKEN]: 'Select a token',
  [TokenInformationFormKeys.OFFICIAL_WEBSITE]: 'https://',
  [TokenInformationFormKeys.OFFICIAL_TWITTER]: 'Twitter account',
  [TokenInformationFormKeys.TITLE]: 'Your title',
  [TokenInformationFormKeys.PERSON_NAME]: 'Your name',
  [TokenInformationFormKeys.TELEGRAM_HANDLER]: 'Example@yourhandle',
  [TokenInformationFormKeys.EMAIL]: 'It must be the official email address',
};

export const TOKEN_INFORMATION_FORM_INITIAL_VALUES: Partial<TTokenInformationFormValues> = {
  [TokenInformationFormKeys.TOKEN]: undefined,
  [TokenInformationFormKeys.OFFICIAL_WEBSITE]: '',
  [TokenInformationFormKeys.OFFICIAL_TWITTER]: '',
  [TokenInformationFormKeys.TITLE]: '',
  [TokenInformationFormKeys.PERSON_NAME]: '',
  [TokenInformationFormKeys.TELEGRAM_HANDLER]: '',
  [TokenInformationFormKeys.EMAIL]: '',
};

export const TOKEN_INFORMATION_FORM_INITIAL_VALIDATE_DATA: TTokenInformationFormValidateData = {
  [TokenInformationFormKeys.TOKEN]: {
    validateStatus: FormValidateStatus.Normal,
    errorMessage: '',
  },
  [TokenInformationFormKeys.OFFICIAL_WEBSITE]: {
    validateStatus: FormValidateStatus.Normal,
    errorMessage: '',
  },
  [TokenInformationFormKeys.OFFICIAL_TWITTER]: {
    validateStatus: FormValidateStatus.Normal,
    errorMessage: '',
  },
  [TokenInformationFormKeys.TITLE]: {
    validateStatus: FormValidateStatus.Normal,
    errorMessage: '',
  },
  [TokenInformationFormKeys.PERSON_NAME]: {
    validateStatus: FormValidateStatus.Normal,
    errorMessage: '',
  },
  [TokenInformationFormKeys.TELEGRAM_HANDLER]: {
    validateStatus: FormValidateStatus.Normal,
    errorMessage: '',
  },
  [TokenInformationFormKeys.EMAIL]: {
    validateStatus: FormValidateStatus.Normal,
    errorMessage: '',
  },
};

export const REQUIRED_ERROR_MESSAGE = 'This field is required';

export const LISTING_TOKEN_TIP = 'Only tokens owned by your connected aelf wallet are displayed here.';

// ================ Select chain ================

export const SELECT_CHAIN_FORM_LABEL_MAP: Record<SelectChainFormKeys, string> = {
  [SelectChainFormKeys.CHAINS]: 'Select chain(s)',
  [SelectChainFormKeys.INITIAL_SUPPLY]: 'Create & Issue Token',
};

export const SELECT_CHAIN_FORM_PLACEHOLDER_MAP: Partial<Record<SelectChainFormKeys, string>> = {
  [SelectChainFormKeys.INITIAL_SUPPLY]: 'Initial supply',
};

export const SELECT_CHAIN_FORM_INITIAL_VALUES: TSelectChainFormValues = {
  [SelectChainFormKeys.CHAINS]: [],
  [SelectChainFormKeys.INITIAL_SUPPLY]: '',
};

export const SELECT_CHAIN_FORM_INITIAL_VALIDATE_DATA: TSelectChainFormValidateData = {
  [SelectChainFormKeys.INITIAL_SUPPLY]: {
    validateStatus: FormValidateStatus.Normal,
    errorMessage: '',
  },
};

export const DEFAULT_CHAINS: TChains = {
  [SelectChainFormKeys.CHAINS]: [],
};

export const SELECT_CHAIN_FORM_CHAIN_NOT_CREATED_STATUS_LIST = [
  ApplicationChainStatusEnum.Unissued,
  ApplicationChainStatusEnum.Issuing,
  ApplicationChainStatusEnum.Issued,
];

export const SELECT_CHAIN_FORM_CHAIN_CREATED_NOT_LISTED_STATUS_LIST = [
  ApplicationChainStatusEnum.PoolInitializing,
  ApplicationChainStatusEnum.PoolInitialized,
  ApplicationChainStatusEnum.Failed,
];

export const SELECT_CHAIN_FORM_CHAIN_LISTED_STATUS_LIST = [ApplicationChainStatusEnum.Complete];

export const SELECT_CHAIN_FORM_CHAIN_DISABLED_STATUS_LIST = [
  ...SELECT_CHAIN_FORM_CHAIN_CREATED_NOT_LISTED_STATUS_LIST,
  ...SELECT_CHAIN_FORM_CHAIN_LISTED_STATUS_LIST,
];

export const SELECT_CHAIN_FORM_CHAIN_TOOLTIP_MAP = {
  LISTED: 'The token is already listed on eBridge.',
  CREATED_NOT_LISTED: 'The token is in the process of being integrated.',
};
