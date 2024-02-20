import { ELFChainConstants, ERCChainConstants, TRCChainConstants } from 'constants/ChainConstants';
import { ZERO } from 'constants/misc';
import { useAElf, useWeb3 } from 'hooks/web3';
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { useEffectOnce, useSearchParam } from 'react-use';
import { isMobileDevices } from 'utils/isMobile';
import type { provider } from 'web3-core';
import { Web3Type } from 'types';
import { breakpointMap } from 'constants/media';
import { useLanguage } from 'i18n';
import { LOCAL_LANGUAGE_LIST } from 'i18n/config';
const INITIAL_STATE = {};
const StoreContext = createContext<any>(INITIAL_STATE);

const mobileWidth = ZERO.plus(breakpointMap.md);
declare type StoreState = { mobile?: boolean };
export function useStore(): [StoreState] {
  return useContext(StoreContext);
}

//reducer payload
function reducer(state: any, { type, payload }: any) {
  switch (type) {
    default:
      return Object.assign({}, state, payload);
  }
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const { chainId, library } = useWeb3();
  const { chainId: aelfChainId, aelfInstances } = useAElf();
  const [mobile, setMobile] = useState<boolean>();
  const { changeLanguage } = useLanguage();
  const language = useSearchParam('language');
  useMemo(() => {
    if (!chainId) return;
    initialized(chainId, library);
  }, [chainId, library]);
  useMemo(() => {
    if (!chainId) return;
    initializedTron(chainId, library);
  }, [chainId, library]);
  useMemo(() => {
    initializedELF(aelfChainId || '', aelfInstances);
  }, [aelfChainId, aelfInstances]);

  // isMobile
  useEffectOnce(() => {
    if (language && LOCAL_LANGUAGE_LIST.includes(language)) changeLanguage(language);
    const resize = () => {
      setMobile(mobileWidth.gt(window.innerWidth) || isMobileDevices());
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  });

  // className
  useEffect(() => {
    const body = window.document.getElementsByTagName('body')[0];
    if (!body) return;
    body.className = 'pc-site';
    const addClassName = [mobile ? 'mobile-site' : 'pc-site'];
    body.className = '';
    addClassName.forEach((i) => {
      if (!body.className.includes(i)) body.className = (body.className.trim() + ' ' + i).trim();
    });
  }, [mobile]);

  return (
    <StoreContext.Provider value={useMemo(() => [{ ...state, mobile }, { dispatch }], [state, mobile])}>
      {children}
    </StoreContext.Provider>
  );
}
function initialized(chainId: number | string, library?: provider) {
  new ERCChainConstants(chainId, library);
}

function initializedTron(chainId: number | string, library?: provider) {
  new TRCChainConstants(chainId, library);
}

function initializedELF(chainId: number | string, aelfInstances?: Web3Type['aelfInstances']) {
  new ELFChainConstants(chainId, aelfInstances);
}
