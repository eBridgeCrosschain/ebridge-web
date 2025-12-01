/* eslint-disable react-hooks/exhaustive-deps */
import { parse, stringify } from 'query-string';
import type { ParseOptions, StringifyOptions } from 'query-string';
import { useMemo, useRef, useCallback, SetStateAction, useState, useEffect } from 'react';
import { useLocation } from 'react-use';
import { useRouter } from 'next/router';

function getDefaultSearch(searchKeys?: string[]) {
  if (!searchKeys) return;

  const obj: any = {};
  searchKeys.forEach((i) => {
    obj[i] = undefined;
  });
  return obj;
}
function getSearchObj(searchKeys?: string[], searchObj?: any) {
  if (!searchKeys) return searchObj;

  const obj: any = {};
  searchKeys.forEach((i) => {
    if (searchObj[i]) obj[i] = searchObj[i];
  });
  return obj;
}

export interface Options {
  navigateMode?: 'push' | 'replace';
  parseOptions?: ParseOptions;
  stringifyOptions?: StringifyOptions;
  searchKeys?: string[];
}

const baseParseConfig: ParseOptions = {
  parseNumbers: false,
  parseBooleans: false,
  arrayFormat: 'index',
};

const baseStringifyConfig: StringifyOptions = {
  skipNull: false,
  skipEmptyString: false,
  arrayFormat: 'index',
};

type UrlState = Record<string, any>;

export default function useUrlSearchState<S extends UrlState = UrlState>(
  initialState?: S | (() => S),
  options?: Options,
) {
  type State = Partial<{ [key in keyof S]: any }>;
  const { navigateMode = 'push', parseOptions, stringifyOptions, searchKeys } = options || {};

  const mergedParseOptions = { ...baseParseConfig, ...parseOptions };
  const mergedStringifyOptions = { ...baseStringifyConfig, ...stringifyOptions };

  const router = useRouter();
  const [, update] = useState({});
  const { search, hash } = useLocation();
  const hashRef = useRef<string>();
  useEffect(() => {
    hashRef.current = hash;
  });
  const initialStateRef = useRef(typeof initialState === 'function' ? (initialState as () => S)() : initialState || {});

  const queryFromUrl = useMemo(() => {
    return parse(search ?? '', mergedParseOptions);
  }, [search]);
  const defaultSearch = useMemo(() => getDefaultSearch(searchKeys), [searchKeys]);

  const targetQuery: State = useMemo(
    () =>
      getSearchObj(searchKeys, {
        ...initialStateRef.current,
        ...queryFromUrl,
      }),
    [queryFromUrl],
  );

  const setSearch = useCallback(
    (search: string) => {
      if (navigateMode === 'replace') {
        router.replace({ hash: hashRef.current, search });
      } else {
        router.push({ hash: hashRef.current, search }, undefined, { scroll: false });
      }
    },
    [router],
  );

  const setState = useCallback(
    (s: SetStateAction<State>) => {
      const newQuery = typeof s === 'function' ? s(targetQuery) : s;
      setSearch(stringify({ ...queryFromUrl, ...(defaultSearch ?? {}), ...newQuery }, mergedStringifyOptions) || '?');
      update({});
    },
    [setSearch, queryFromUrl, targetQuery, defaultSearch],
  );

  const clear = useCallback(() => {
    !defaultSearch ? setSearch('') : setState(defaultSearch);
  }, [defaultSearch, setState]);

  return [targetQuery, setState, clear] as const;
}
