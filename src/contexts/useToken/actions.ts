import { basicActions } from 'contexts/utils';
export declare type TokenState = {
  tokenPriceMap?: { [symbol: string]: string | number };
};
export enum TokenActions {
  destroy = 'DESTROY',
  addTokenPrice = 'ADD_TOKEN_PRICE',
}

export const tokenActions = {
  addTokenPrice: (symbol: string, amount: string | number) =>
    basicActions(TokenActions['addTokenPrice'], { symbol, amount }),
};

export const { addTokenPrice } = tokenActions;
