import { BasicActions } from 'contexts/utils';
import { createContext, useContext, useMemo, useReducer } from 'react';
import { TokenActions, TokenState } from './actions';

const INITIAL_STATE = {};

const TokenContext = createContext<any>([INITIAL_STATE]);

export function useToken(): [TokenState, BasicActions<TokenActions>] {
  return useContext(TokenContext);
}

const reducer = (state: TokenState, { type, payload }: { type: TokenActions; payload: any }) => {
  switch (type) {
    case TokenActions.destroy: {
      return {};
    }
    case TokenActions.addTokenPrice: {
      const { symbol, amount } = payload;
      const tokenPriceMap = { ...state.tokenPriceMap, [symbol]: amount };
      return Object.assign({}, state, { tokenPriceMap });
    }
    default: {
      const { destroy } = payload;
      if (destroy) return Object.assign({}, payload);
      return Object.assign({}, state, payload);
    }
  }
};

export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]: [TokenState, BasicActions<TokenActions>['dispatch']] = useReducer(reducer, INITIAL_STATE);
  const actions = useMemo(() => ({ dispatch }), [dispatch]);
  return (
    <TokenContext.Provider value={useMemo(() => [state, actions], [actions, state])}>{children}</TokenContext.Provider>
  );
}
