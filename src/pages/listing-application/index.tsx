import { useEffect } from 'react';
import { useRouter } from 'next/router';

const ListingApplicationIndex = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/listing-application/token-information');
  }, [router]);

  return null;
};

export default ListingApplicationIndex;
