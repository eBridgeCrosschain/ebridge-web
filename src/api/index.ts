import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { BASE_APIS, BASE_REQ_TYPES, DEFAULT_METHOD, EXPAND_APIS, EXPAND_REQ_TYPES } from './list';
import myServer from './server';
import { IBaseRequest } from './types';
import { spliceUrl, service } from './utils';

function baseRequest({ url, method = DEFAULT_METHOD, query = '', ...c }: IBaseRequest) {
  return service({
    ...c,
    url: spliceUrl(url, query),
    method,
  });
}

myServer.parseRouter('base', BASE_APIS);

Object.entries(EXPAND_APIS).forEach(([key, value]) => {
  myServer.parseRouter(key, value);
});

const request: BASE_REQ_TYPES & EXPAND_REQ_TYPES = Object.assign({}, myServer.base, myServer);

const requestGql = ({ uri }: { uri: string }) => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    queryDeduplication: false,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
      query: {
        fetchPolicy: 'network-only',
      },
      // ...defaultOptions,
    },
    link: new HttpLink({
      uri,
    }),
  });
};

export { baseRequest, request, requestGql };
