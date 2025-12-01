import { useEffect, useMemo, useState } from 'react';
import { request } from 'api';

export default function useMaskQuery() {
  const [isShowMask, setIsShowMask] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const rs = await request.cms.getToggleResultOfMask();
        setIsShowMask(rs?.data?.isShowMask);
        // eslint-disable-next-line no-empty
      } catch (e) {}
      setIsLoading(false);
    }
    fetchData();
  }, []);
  return useMemo(() => {
    return { isShowMask, isLoading };
  }, [isShowMask, isLoading]);
}
