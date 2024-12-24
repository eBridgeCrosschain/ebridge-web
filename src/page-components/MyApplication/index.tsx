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
import { useRouter } from 'next/router';
import { CONTACT_US_FORM_URL, ROUTE_PATHS } from 'constants/link';
import { openWithBlank } from 'utils/link';
import { sleep } from 'utils';
import { useInitAelfWallet, useSetAelfAuthFromStorage } from 'hooks/aelfAuthToken';

const DefaultSkipCount = 0;
const DefaultMaxResultCount = 10;
const DefaultTotalCount = 0;

function MyApplications() {
  const router = useRouter();
  const isMd = useMediaQueries('md');
  // const { setLoading } = useLoading(); // TODO
  const { isActive } = useAElf();
  const handleAelfLogin = useAelfLogin();
  const setAelfAuthFromStorage = useSetAelfAuthFromStorage();
  useInitAelfWallet();
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
        await setAelfAuthFromStorage();
        await sleep(500);

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
    [maxResultCount, setAelfAuthFromStorage, skipPageCount],
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
  const initRef = useRef(init);
  initRef.current = init;

  const handleResetList = useCallback(async () => {
    await getApplicationData({ skip: DefaultSkipCount, max: DefaultMaxResultCount });
  }, [getApplicationData]);

  const connectAndInit = useCallback(() => {
    if (!isActive) {
      handleAelfLogin(true, initRef.current);
    } else {
      initRef.current();
    }
  }, [handleAelfLogin, isActive]);
  const connectAndInitRef = useRef(connectAndInit);
  connectAndInitRef.current = connectAndInit;
  const connectAndInitSleep = useCallback(async () => {
    // setLoading(true); // TODO
    // Delay 3s to determine the login status, because the login data is acquired slowly, to prevent the login pop-up window from being displayed first and then automatically logging in successfully later.
    await sleep(3000);
    connectAndInitRef.current();
  }, []);
  useEffectOnce(() => {
    connectAndInitSleep();
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
    <div className={clsx('page-content', 'main-page-content-wrap', styles['my-applications-page-container-wrapper'])}>
      {!isMd && (
        <div className={styles['my-applications-page-back']} onClick={() => router.push(ROUTE_PATHS.HOME)}>
          <CommonImage className={styles['my-applications-page-back-icon']} src={backIcon} />
          <div className={styles['my-applications-page-back-text']}>{BUTTON_TEXT_BACK}</div>
        </div>
      )}

      <div className={clsx(styles['my-applications-page-body'])}>
        <div className={clsx(isMd ? 'flex-column' : 'flex-row-center-between', styles['my-applications-page-title'])}>
          <div className={styles['my-applications-page-title-text']}>{MY_APPLICATIONS}</div>

          <div className={styles['right-tip']}>
            <span>{`If you need any support, please`}&nbsp;</span>
            <span className={styles['action']} onClick={() => openWithBlank(CONTACT_US_FORM_URL)}>{`contact us`}</span>
            <span>{`.`}</span>
          </div>
        </div>
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
