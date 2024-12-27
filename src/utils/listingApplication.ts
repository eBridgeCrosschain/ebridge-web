import queryString from 'query-string';
import { ROUTE_PATHS } from 'constants/link';
import { ListingStep, LISTING_STEP_PATHNAME_MAP } from 'constants/listingApplication';
import { TSearchParams } from 'types/listingApplication';

export const getListingUrl = (step: ListingStep, params?: TSearchParams) => {
  let search;
  if (params) {
    switch (step) {
      case ListingStep.TOKEN_INFORMATION:
        search = queryString.stringify({
          symbol: params.symbol,
        });
        break;
      case ListingStep.SELECT_CHAIN:
        search = queryString.stringify({
          symbol: params.symbol,
        });
        break;
      case ListingStep.INITIALIZE_TOKEN_POOL:
        search = queryString.stringify({
          networks: params.networks,
        });
        break;
      case ListingStep.ADD_TOKEN_POOL:
        search = queryString.stringify({
          symbol: params.symbol,
          id: params.id,
        });
        break;
    }
  }
  return `${ROUTE_PATHS.LISTING_APPLICATION}${LISTING_STEP_PATHNAME_MAP[step]}${search ? '?' + search : ''}`;
};
