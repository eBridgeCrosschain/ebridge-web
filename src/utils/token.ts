import { SYMBOL_FORMAT_MAP } from 'constants/misc';

export const formatSymbol = (symbol = '') => {
  if (SYMBOL_FORMAT_MAP[symbol]) return SYMBOL_FORMAT_MAP[symbol];
  return symbol;
};
