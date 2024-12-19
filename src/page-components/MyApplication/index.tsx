import clsx from 'clsx';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { getMyApplicationList } from 'utils/api/application';
import MyApplicationTable from './MyApplicationTable';
import useMediaQueries from 'hooks/useMediaQueries';
import { useAElf } from 'hooks/web3';
import { useAelfLogin } from 'hooks/wallet';
import { eventBus } from 'utils';
import storages from 'constants/storages';
import styles from './styles.module.less';
import CommonImage from 'components/CommonImage';
import { backIcon } from 'assets/images';
import { BUTTON_TEXT_BACK } from 'constants/misc';
import { MY_APPLICATIONS } from 'constants/listingApplication';
import LinkForBlank from 'components/LinkForBlank';

function MyApplications() {
  const isMd = useMediaQueries('md');
  // const { setLoading } = useLoading(); // TODO
  const { isActive } = useAElf();
  const aelfLogin = useAelfLogin();

  const [currentApplicationList, setCurrentApplicationList] = useState<any[]>([]);

  // pagination
  const [skipPageCount, setSkipPageCount] = useState(0);
  const [maxResultCount, setMaxResultCount] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const getApplicationData = useCallback(
    async ({ skip, max }: { skip?: number; max?: number }) => {
      console.log(skip, max);
      try {
        // setLoading(true);

        const currentSkipPageCount = typeof skip !== 'number' ? skipPageCount : skip;
        const currentMaxCount = typeof max !== 'number' ? maxResultCount : max;
        const currentSkipCount = currentSkipPageCount * currentMaxCount;
        const res = await getMyApplicationList({
          skipCount: currentSkipCount,
          maxResultCount: currentMaxCount,
        });

        setCurrentApplicationList(res.items);
        setTotalCount(res.totalCount);
      } catch (error) {
        console.log('>>>>>> getApplicationData error', error);
      } finally {
        // setLoading(false);
      }
    },
    [maxResultCount, skipPageCount],
  );

  // web get page date
  const tableOnChange = useCallback(
    (page: number, pageSize: number) => {
      let skip = skipPageCount;
      let max = maxResultCount;
      const newPage = page - 1;
      if (newPage !== skipPageCount) {
        skip = newPage;
        setSkipPageCount(newPage);
      }
      if (maxResultCount !== pageSize) {
        // pageSize change and skipCount need init
        skip = 0;
        max = pageSize;
        setSkipPageCount(0);
        setMaxResultCount(pageSize);
      }

      getApplicationData({
        skip,
        max,
      });
    },
    [getApplicationData, maxResultCount, skipPageCount],
  );

  const init = useCallback(async () => {
    getApplicationData({});
  }, [getApplicationData]);

  useEffectOnce(() => {
    if (!isActive) {
      aelfLogin(); // TODO
    } else {
      init();
    }
  });

  const initForLogout = useCallback(async () => {
    setCurrentApplicationList([]);
    setSkipPageCount(0);
    setMaxResultCount(10);
    setTotalCount(0);
  }, []);
  const initLogoutRef = useRef(initForLogout);
  initLogoutRef.current = initForLogout;

  const initForReLogin = useCallback(async () => {
    getApplicationData({ skip: 0, max: 10 });
  }, [getApplicationData]);
  const initForReLoginRef = useRef(initForReLogin);
  initForReLoginRef.current = initForReLogin;

  const Listeners = useMemo(() => {
    return [
      { eventName: storages.loginSuccess, listener: initForReLoginRef.current },
      { eventName: storages.logoutSuccess, listener: initLogoutRef.current },
    ];
  }, []);

  useEffectOnce(() => {
    Listeners.forEach(({ eventName, listener }) => {
      eventBus.addListener(eventName, listener);
    });
    return () => {
      Listeners.forEach(({ eventName, listener }) => {
        eventBus.removeListener(eventName, listener);
      });
    };
  });

  return (
    <div className={styles['my-applications-page-container-wrapper']}>
      {!isMd && (
        <LinkForBlank
          className={styles['my-applications-page-back']}
          href="/"
          element={
            <>
              <CommonImage src={backIcon} />
              <div className={styles['my-applications-page-back-text']}>{BUTTON_TEXT_BACK}</div>
            </>
          }
        />
      )}

      <div className={clsx(styles['my-applications-page-body'])}>
        <div className={styles['my-applications-page-title']}>{MY_APPLICATIONS}</div>
        <MyApplicationTable
          totalCount={totalCount}
          applicationList={currentApplicationList}
          tableOnChange={tableOnChange}
          maxResultCount={maxResultCount}
          skipPageCount={skipPageCount}
        />
      </div>
    </div>
  );
}

export default memo(MyApplications);
