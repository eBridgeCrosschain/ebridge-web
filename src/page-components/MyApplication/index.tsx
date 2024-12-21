import clsx from 'clsx';
import { memo, useCallback, useRef, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { getMyApplicationList } from 'utils/api/application';
import MyApplicationTable from './MyApplicationTable';
import useMediaQueries from 'hooks/useMediaQueries';
import { useAElf } from 'hooks/web3';
import { useAelfLogin } from 'hooks/wallet';
import eBridgeEventBus from 'utils/eBridgeEventBus';
import styles from './styles.module.less';
import CommonImage from 'components/CommonImage';
import { backIcon } from 'assets/images';
import { BUTTON_TEXT_BACK } from 'constants/misc';
import { MY_APPLICATIONS } from 'constants/listingApplication';
import LinkForBlank from 'components/LinkForBlank';

const DefaultSkipCount = 0;
const DefaultMaxResultCount = 10;
const DefaultTotalCount = 0;

function MyApplications() {
  const isMd = useMediaQueries('md');
  // const { setLoading } = useLoading(); // TODO
  const { isActive } = useAElf();
  const aelfLogin = useAelfLogin();

  const [currentApplicationList, setCurrentApplicationList] = useState<any[]>([]);

  // pagination
  const [skipPageCount, setSkipPageCount] = useState(DefaultSkipCount);
  const [maxResultCount, setMaxResultCount] = useState(DefaultMaxResultCount);
  const [totalCount, setTotalCount] = useState(DefaultTotalCount);

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
        skip = DefaultSkipCount;
        max = pageSize;
        setSkipPageCount(DefaultSkipCount);
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

  const handleResetList = useCallback(async () => {
    await getApplicationData({ skip: DefaultSkipCount, max: DefaultMaxResultCount });
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
    setSkipPageCount(DefaultSkipCount);
    setMaxResultCount(DefaultMaxResultCount);
    setTotalCount(DefaultSkipCount);
  }, []);
  const initLogoutRef = useRef(initForLogout);
  initLogoutRef.current = initForLogout;

  const initForReLogin = useCallback(async () => {
    getApplicationData({ skip: DefaultSkipCount, max: DefaultMaxResultCount });
  }, [getApplicationData]);
  const initForReLoginRef = useRef(initForReLogin);
  initForReLoginRef.current = initForReLogin;

  useEffectOnce(() => {
    // log in
    const { remove: removeLoginSuccess } = eBridgeEventBus.AelfLoginSuccess.addListener(() =>
      initForReLoginRef.current(),
    );
    // log out \ exit
    const { remove: removeLogoutSuccess } = eBridgeEventBus.AelfLogoutSuccess.addListener(() => {
      initLogoutRef.current();
    });

    return () => {
      removeLoginSuccess();
      removeLogoutSuccess();
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
          onResetList={handleResetList}
        />
      </div>
    </div>
  );
}

export default memo(MyApplications);
