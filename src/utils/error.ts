export const handleError = (error: any) => {
  return error?.error || error;
};

export function handleContractError(error?: any, req?: any) {
  if (typeof error === 'string') return { message: error };
  if (error?.message) return error;
  if (error?.Error) {
    return {
      message: error.Error.Details || error.Error.Message || error.Error,
      code: error.Error.Code,
    };
  }
  return {
    code: req?.error?.message?.Code || req?.error,
    message: req?.errorMessage?.message || req?.error?.message?.Message,
  };
}

export const handleErrorMessage = (error: any, errorText?: string) => {
  if (error?.status === 500) {
    return errorText || 'Failed to fetch data';
  }
  error = handleError(error);
  error = handleContractError(error);
  if (typeof error.message === 'string') errorText = error.message;
  return errorText || '';
};

export const handleWebLoginErrorMessage = (error: any, errorText?: string) => {
  if (error.nativeError) {
    error = error.nativeError;
  }

  return handleErrorMessage(error, errorText);
};