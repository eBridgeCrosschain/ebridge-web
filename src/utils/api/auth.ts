import { service } from 'api/utils';
import axios from 'axios';
import { BASE_AUTH_URL } from 'constants/index';
import { stringify } from 'query-string';
import { PortkeyVersion } from 'types/wallet';
import eBridgeEventBus from 'utils/eBridgeEventBus';
import { JWTData, QueryAuthApiExtraRequest, setLocalJWT } from 'utils/aelfAuthToken';

type QueryAuthApiBaseConfig = {
  grant_type: string;
  scope: string;
  client_id: string;
  version: PortkeyVersion;
};

const queryAuthApiBaseConfig: QueryAuthApiBaseConfig = {
  grant_type: 'signature',
  scope: 'CrossChainServer',
  client_id: 'CrossChainServer_App',
  version: PortkeyVersion.v2,
};

export const queryAuthApi = async (config: QueryAuthApiExtraRequest): Promise<string> => {
  const data = { ...queryAuthApiBaseConfig, ...config };
  const res = await axios.post<JWTData>(`${BASE_AUTH_URL}/connect/token`, stringify(data), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const token_type = res.data.token_type;
  const access_token = res.data.access_token;

  service.defaults.headers.common['Authorization'] = `${token_type} ${access_token}`;
  eBridgeEventBus.AelfAuthTokenSuccess.emit();

  if (localStorage) {
    const key = (config?.ca_hash || config.source) + config.managerAddress;
    setLocalJWT(key, res.data);
  }

  return `${token_type} ${access_token}`;
};
