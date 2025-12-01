import { Dispatch, Reducer, ReducerAction, ReducerState, useCallback, useMemo, useReducer } from 'react';

export type StorageOptions = {
  key?: string;
  blacklist?: string[];
  storage?: Storage;
};

export default function useStorageReducer<R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>,
  options?: StorageOptions,
): [ReducerState<R>, Dispatch<ReducerAction<R>>] {
  const { key, blacklist, storage = localStorage } = options || {};
  const initialStorageState = useMemo(() => {
    if (!key) return null;
    const state = storage.getItem(key);
    if (!state) return state;
    return JSON.parse(state);
  }, [key, storage]);
  const f: Reducer<any, any> = useCallback(
    (...rest) => {
      const state = reducer(...rest);
      const storageState = { ...state };
      if (blacklist)
        blacklist.forEach((i) => {
          delete storageState[i];
        });
      key && storage.setItem(key, JSON.stringify(storageState));
      return state;
    },
    [reducer, blacklist, key, storage],
  );
  return useReducer(f, initialStorageState || initialState);
}
