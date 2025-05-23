import { useEffect, useMemo, useRef, useState, memo, useCallback } from 'react';
import { useRouter } from 'next/router';
import CommonSteps from 'components/CommonSteps';
import CommonImage from 'components/CommonImage';
import UnsavedChangesWarningModal from './UnsavedChangesWarningModal';
import TokenInformation from './TokenInformation';
import SelectChain from './SelectChain';
import InitializeTokenPool from './InitializeTokenPool';
import { backIcon } from 'assets/images';
import { LISTING_STEP_ITEMS, ListingStep, LISTING_STEP_PATHNAME_MAP } from 'constants/listingApplication';
import { ROUTE_PATHS } from 'constants/link';
import { useMobile } from 'contexts/useStore/hooks';
import { isMobileDevices } from 'utils/isMobile';
import { getListingUrl } from 'utils/listingApplication';
import { useAelfAuthListener } from 'hooks/wallet';
import { TSearchParams } from 'types/listingApplication';
import styles from './styles.module.less';

let globalCanAccessStep = false;

function ListingApplication() {
  const isMobile = useMobile();
  const router = useRouter();
  const { query } = router;
  const symbol = useMemo(() => (query.symbol as string) || undefined, [query]);
  const networks = useMemo(() => {
    const str = query.networks || '';
    try {
      return str && typeof str === 'string' ? JSON.parse(str) : [];
    } catch (error) {
      return [];
    }
  }, [query]);

  const [currentStep, setCurrentStep] = useState<ListingStep | undefined>();
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

  const isNavigatingRef = useRef(false);
  const nextUrlRef = useRef('');

  useAelfAuthListener();

  useEffect(() => {
    const { stepText } = router.query;
    const step = Object.values(LISTING_STEP_PATHNAME_MAP).findIndex(
      (item) => stepText && typeof stepText === 'string' && item.includes(stepText),
    );

    if (step === ListingStep.TOKEN_INFORMATION || step === ListingStep.SELECT_CHAIN || globalCanAccessStep) {
      setCurrentStep(step);
    } else {
      router.replace('/my-applications');
    }
  }, [router]);

  useEffect(() => {
    if (isMobileDevices()) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep === ListingStep.TOKEN_INFORMATION || currentStep === ListingStep.SELECT_CHAIN) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentStep]);

  const handleNextStep = useCallback(
    (params?: TSearchParams) => {
      if (typeof currentStep !== 'number') return;
      const nextStep = currentStep + 1;
      if (nextStep <= ListingStep.INITIALIZE_TOKEN_POOL) {
        globalCanAccessStep = true;
        const replaceUrl = getListingUrl(nextStep, params);
        router.replace(replaceUrl);
      }
    },
    [currentStep, router],
  );

  const handlePrevStep = useCallback(
    (params?: TSearchParams) => {
      if (typeof currentStep !== 'number') return;
      const prevStep = currentStep - 1;
      if (prevStep >= ListingStep.TOKEN_INFORMATION) {
        globalCanAccessStep = true;
        const replaceUrl = getListingUrl(prevStep, params);
        router.replace(replaceUrl);
      }
    },
    [currentStep, router],
  );

  const handleWarningModalConfirm = useCallback(() => {
    setIsWarningModalOpen(false);
    if (nextUrlRef.current === 'back') {
      isNavigatingRef.current = true;
      router.back();
    } else if (nextUrlRef.current) {
      isNavigatingRef.current = true;
      router.push(nextUrlRef.current);
    }
  }, [router]);

  const handleWarningModalCancel = useCallback(() => {
    setIsWarningModalOpen(false);
    nextUrlRef.current = '';
  }, []);

  const renderForm = useMemo(() => {
    switch (currentStep) {
      case ListingStep.TOKEN_INFORMATION:
        return <TokenInformation symbol={symbol} handleNextStep={handleNextStep} />;
      case ListingStep.SELECT_CHAIN:
        return <SelectChain symbol={symbol} handleNextStep={handleNextStep} handlePrevStep={handlePrevStep} />;
      case ListingStep.INITIALIZE_TOKEN_POOL:
        return <InitializeTokenPool networks={networks} />;
      default:
        return null;
    }
  }, [currentStep, handleNextStep, handlePrevStep, networks, symbol]);

  return (
    <>
      <div className={styles['listing-container']}>
        {typeof currentStep === 'number' && (
          <div className={styles['listing-content']}>
            {!isMobile && (
              <div
                className={styles['listing-back']}
                onClick={() => {
                  if (currentStep === ListingStep.TOKEN_INFORMATION || currentStep === ListingStep.SELECT_CHAIN) {
                    setIsWarningModalOpen(true);
                    nextUrlRef.current = window.history.length > 1 ? 'back' : ROUTE_PATHS.BRIDGE;
                  } else if (window.history.length > 1) {
                    router.back();
                  } else {
                    router.push(ROUTE_PATHS.BRIDGE);
                  }
                }}>
                <CommonImage className={styles['listing-back-icon']} src={backIcon} priority />
                <span className={styles['listing-back-text']}>Back</span>
              </div>
            )}
            <div className={styles['listing-card-list']}>
              <div className={styles['listing-card']}>
                <div className={styles['listing-card-steps-title']}>Listing Application</div>
                <CommonSteps stepItems={LISTING_STEP_ITEMS} current={currentStep} />
              </div>
              <div className={styles['listing-card']}>
                <div className={styles['listing-card-form-content']}>{renderForm}</div>
              </div>
            </div>
          </div>
        )}
      </div>
      <UnsavedChangesWarningModal
        open={isWarningModalOpen}
        onCancel={handleWarningModalCancel}
        onOk={handleWarningModalConfirm}
      />
    </>
  );
}

export default memo(ListingApplication);
