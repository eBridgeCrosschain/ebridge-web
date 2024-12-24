import BigNumber from 'bignumber.js';

export const parseWithCommas = (value?: string | null) => {
  return value ? new BigNumber(value.replace(/,/g, '')).toFixed() : '';
};

export const parseWithStringCommas = (value?: string | null) => {
  return value ? value.replace(/,/g, '') : '';
};

export const replaceCharacter = (str: string, replaced: string, replacedBy: string) => {
  return str?.replace(replaced, replacedBy);
};

export const formatSymbolDisplay = (str: string) => {
  if (!str) return '';

  // Prevent malicious tampering of the token display issued by users
  if (str?.includes('SGR-1')) return replaceCharacter(str, '-1', '');

  return str;
};

export const formatListWithAnd = (items: string[]): string => {
  if (items.length > 1) {
    const lastItem = items.pop();
    return `${items.join(', ')} and ${lastItem}`;
  }
  return items.join(', ');
};
