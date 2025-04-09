import { NATIVE_TOKEN_LIST } from 'constants/index';
import { SYMBOL_FORMAT_MAP } from 'constants/misc';
import { API_TOKEN_MAP } from 'constants/token';

export const formatSymbol = (symbol = '') => {
  if (SYMBOL_FORMAT_MAP[symbol]) return SYMBOL_FORMAT_MAP[symbol];
  return symbol;
};

export const formatAPISymbol = (symbol = '') => {
  if (API_TOKEN_MAP[symbol]) return API_TOKEN_MAP[symbol];
  return symbol;
};

export const formatSymbolAndNativeToken = (symbol = '') => {
  if (SYMBOL_FORMAT_MAP[symbol]) return SYMBOL_FORMAT_MAP[symbol];
  if (NATIVE_TOKEN_LIST.includes(symbol)) return symbol?.replace('W', '');
  return symbol;
};
