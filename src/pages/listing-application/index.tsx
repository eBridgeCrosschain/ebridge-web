import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getListingUrl } from 'utils/listingApplication';
import { ListingStep } from 'constants/listingApplication';

const ListingApplicationIndex = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace(getListingUrl(ListingStep.TOKEN_INFORMATION));
  }, [router]);

  return null;
};

export default ListingApplicationIndex;
