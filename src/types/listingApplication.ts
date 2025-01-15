import { TApplicationChainStatusItem, TApplicationTokenStatus } from './api';

export enum TMyApplicationStatus {
  Processing = 'Processing',
  Succeed = 'Complete',
  Failed = 'Failed',
}

export type TSearchParams = {
  symbol?: string;
  id?: string;
  networks?: string;
};

export enum TokenInformationFormKeys {
  TOKEN = 'token',
  OFFICIAL_WEBSITE = 'officialWebsite',
  OFFICIAL_TWITTER = 'officialTwitter',
  TITLE = 'title',
  PERSON_NAME = 'personName',
  TELEGRAM_HANDLER = 'telegramHandler',
  EMAIL = 'email',
}

export type TTokenItem = {
  name: string;
  symbol: string;
  icon: string;
  totalSupply: number;
  status?: TApplicationTokenStatus;
};

export type TTokenConfig = {
  liquidityInUsd: string;
  holders: number;
};

export type TTokenInformationFormValues = {
  [TokenInformationFormKeys.TOKEN]: TTokenItem;
  [TokenInformationFormKeys.OFFICIAL_WEBSITE]: string;
  [TokenInformationFormKeys.OFFICIAL_TWITTER]: string;
  [TokenInformationFormKeys.TITLE]: string;
  [TokenInformationFormKeys.PERSON_NAME]: string;
  [TokenInformationFormKeys.TELEGRAM_HANDLER]: string;
  [TokenInformationFormKeys.EMAIL]: string;
};

export enum FormValidateStatus {
  Error = 'error',
  Normal = '',
}

export type TTokenInformationFormValidateData = {
  [key in TokenInformationFormKeys]: {
    validateStatus: FormValidateStatus;
    errorMessage: string;
  };
};

export enum SelectChainFormKeys {
  CHAINS = 'chains',
  INITIAL_SUPPLY = 'initialSupply',
}

export type TChains = {
  [SelectChainFormKeys.CHAINS]: TApplicationChainStatusItem[];
};

export type TSelectChainFormValues = TChains & {
  [SelectChainFormKeys.INITIAL_SUPPLY]: string;
};

export type TSelectChainFormValidateData = {
  [SelectChainFormKeys.INITIAL_SUPPLY]: {
    validateStatus: FormValidateStatus;
    errorMessage: string;
  };
};
