export const replaceCharacter = (str: string, replaced: string, replacedBy: string) => {
  return str?.replace(replaced, replacedBy);
};

export const formatSymbolDisplay = (str: string) => {
  if (!str) return '';

  // Prevent malicious tampering of the token display issued by users
  if (str?.includes('SGR-1')) return replaceCharacter(str, '-1', '');

  return str;
};
