import LoadingModal, { ILoadingModalProps } from 'components/Loading/LoadingModal';
import ResultModal, { IResultModalProps, ResultType } from 'components/Loading/ResultModal';
import { useMemo } from 'react';
import { useSetState } from 'react-use';
const INIT_RESULT_MODAL_PROPS = {
  open: false,
  type: ResultType.APPROVED,
  onRetry: undefined,
};

export type TLoadingModalParams = {
  loadingModalProps?: ILoadingModalProps;
  resultModalProps?: IResultModalProps;
};

export default function useLoadingModal(params?: TLoadingModalParams) {
  const [loadingModalProps, setLoadingModal] = useSetState<ILoadingModalProps>();
  const [resultModalProps, setResultModal] = useSetState<IResultModalProps>(INIT_RESULT_MODAL_PROPS);
  const modal = useMemo(() => {
    return (
      <>
        <LoadingModal {...params?.loadingModalProps} {...loadingModalProps} />
        <ResultModal
          {...params?.resultModalProps}
          {...resultModalProps}
          onClose={() => {
            setResultModal(INIT_RESULT_MODAL_PROPS);
            resultModalProps.onClose?.();
            params?.resultModalProps?.onClose?.();
          }}
        />
      </>
    );
  }, [loadingModalProps, params?.loadingModalProps, params?.resultModalProps, resultModalProps, setResultModal]);

  return { loadingOpen: loadingModalProps.open, modal, setLoadingModal, setResultModal };
}
