export const errorCodes: Record<string, string> = {
  '-32603': 'Internal JSON-RPC error',
};
export const getErrorMessage = (errorCode: number) => {
  const errorMessage = errorCodes?.[errorCode.toString()] || '';
  return errorMessage;
};
