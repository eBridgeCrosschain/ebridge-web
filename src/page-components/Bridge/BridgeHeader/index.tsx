import { useLanguage } from 'i18n';
import MainContentHeader from 'components/MainContentHeader';
import { useHomeContext } from '../HomeContext';
import { setLimitAmountDescModal } from '../HomeContext/actions';

export default function BridgeHeader() {
  const { t } = useLanguage();
  const [, { dispatch }] = useHomeContext();
  return (
    <MainContentHeader
      title={t('Bridge to aelf')}
      tipConfig={{
        label: t('Transfer limits'),
        onClick: () => dispatch(setLimitAmountDescModal(true)),
      }}
    />
  );
}
