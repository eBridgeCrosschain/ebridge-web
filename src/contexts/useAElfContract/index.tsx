import { BasicActions } from 'contexts/utils';
import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { AElfContractState, AElfContractActions } from './actions';

const INITIAL_STATE: AElfContractState = {};
const ContractContext = createContext<any>(INITIAL_STATE);

export function useAElfContractContext(): [AElfContractState, BasicActions<AElfContractActions>] {
  return useContext(ContractContext);
}

//reducer
function reducer(state: AElfContractState, { type, payload }: { type: AElfContractActions; payload: any }) {
  switch (type) {
    case AElfContractActions.destroy: {
      return {};
    }
    default: {
      const { destroy } = payload;
      if (destroy) return Object.assign({}, payload);
      return Object.assign({}, state, payload);
    }
  }
}
export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]: [AElfContractState, BasicActions<AElfContractActions>['dispatch']] = useReducer(
    reducer,
    INITIAL_STATE,
  );
  const actions = useMemo(() => ({ dispatch }), [dispatch]);
  return (
    <ContractContext.Provider value={useMemo(() => [state, actions], [state, actions])}>
      {children}
    </ContractContext.Provider>
  );
}
