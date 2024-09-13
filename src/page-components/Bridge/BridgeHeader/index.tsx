import { useMemo } from 'react';
import { useLanguage } from 'i18n';
import MainContentHeader from 'components/MainContentHeader';
import { useWalletContext } from 'contexts/useWallet';
import { useHomeContext } from '../HomeContext';
import { setLimitAmountDescModal } from '../HomeContext/actions';

export default function BridgeHeader() {
  const { t } = useLanguage();
  const [, { dispatch }] = useHomeContext();
  const [{ fromOptions, toOptions }] = useWalletContext();
  const isFromELF = fromOptions?.chainType === 'ELF';
  const isToELF = toOptions?.chainType === 'ELF';
  const title = useMemo(() => {
    if (isFromELF && isToELF) {
      return 'Bridge within aelf';
    } else if (isFromELF) {
      return 'Bridge from aelf';
    } else {
      return 'Bridge to aelf';
    }
  }, [isFromELF, isToELF]);
  return (
    <MainContentHeader
      title={t(title)}
      tipConfig={{
        label: t('Transfer limits'),
        onClick: () => dispatch(setLimitAmountDescModal(true)),
      }}
    />
  );
}
