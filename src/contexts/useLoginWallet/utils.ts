import { gql } from '@apollo/client';
import { PortkeyDidV1 } from 'aelf-web-login';
import { SupportedELFChainList } from 'constants/index';
import storages from 'constants/storages';

export type TAccounts = Record<string, string[]>;
export type TAccountsStorage = Record<string, TAccounts>;

export const CA_HOLDER_INFO_QUERY = gql`
  query caHolderInfo($dto: GetCAHolderInfoDto) {
    caHolderInfo(dto: $dto) {
      id
      chainId
      caHash
      caAddress
      originChainId
    }
  }
`;

export const getPortkeySDKAccount = (accounts?: Record<string, string>): TAccounts => {
  if (!accounts) throw new Error('getPortkeyV2SDKAccount: accounts invalid');
  const _accounts: TAccounts = {};
  const address = Object.values(accounts)[0] || '';
  SupportedELFChainList.forEach((chain) => {
    const _chainId = chain.CHAIN_INFO.chainId as string;
    _accounts[_chainId] = [`ELF_${address}_${_chainId}`];
  });
  return _accounts;
};

export const getPortkeyAccountStorage = (): TAccountsStorage | undefined => {
  try {
    const portkeyCAAddressesStr = localStorage.getItem(storages.portkeyCAAddresses);
    if (!portkeyCAAddressesStr) return undefined;
    return JSON.parse(portkeyCAAddressesStr);
  } catch (error) {
    console.log('parse portkeyCAAddresses', error);
    return undefined;
  }
};

export const setPortkeyAccountStorage = (caHash: string, accounts: TAccounts) => {
  const preData = getPortkeyAccountStorage();
  localStorage.setItem(
    storages.portkeyCAAddresses,
    JSON.stringify({
      ...preData,
      [caHash]: accounts,
    }),
  );
};

export const getPortkeyV1SDKAccount = async (
  sdkAccounts?: Record<string, string>,
  caHash?: string,
): Promise<TAccounts> => {
  const _accounts: TAccounts = {};
  let isAddressLack = false;
  if (!caHash) throw new Error('getPortkeyV1SDKAccount: caHash invalid');
  if (!sdkAccounts) throw new Error('getPortkeyV1SDKAccount: sdkAccounts invalid');
  for (let i = 0; i < SupportedELFChainList.length; i++) {
    const _chainId = SupportedELFChainList[i].CHAIN_INFO.chainId as string;
    let caAddress = sdkAccounts[_chainId];
    if (!caAddress) {
      const portkeyCAAddress = getPortkeyAccountStorage()?.[caHash];
      if (portkeyCAAddress && portkeyCAAddress[_chainId]) {
        console.log('hit cache', portkeyCAAddress);
        _accounts[_chainId] = portkeyCAAddress[_chainId];
        continue;
      }
      console.log('need get caAddress', caHash, _chainId);
      isAddressLack = true;
      const res = await PortkeyDidV1.did.config.graphQLClient?.query({
        query: CA_HOLDER_INFO_QUERY,
        variables: {
          dto: {
            caHash,
            maxResultCount: 2,
            skipCount: 0,
            chainId: _chainId,
          },
        },
      });
      caAddress = res?.data.caHolderInfo[0]?.caAddress || '';
    }
    _accounts[_chainId] = [`ELF_${caAddress}_${_chainId}`];
  }
  if (isAddressLack) {
    console.log('isAddressLack', caHash, _accounts);
    setPortkeyAccountStorage(caHash, _accounts);
  }
  return _accounts;
};
