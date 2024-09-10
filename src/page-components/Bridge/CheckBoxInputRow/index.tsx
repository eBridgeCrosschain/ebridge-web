import { useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useLanguage } from 'i18n';
import { Checkbox, Input, Row, Tooltip } from 'antd';
import CommonImage from 'components/CommonImage';
import useMediaQueries from 'hooks/useMediaQueries';
import { useWallet } from 'contexts/useWallet/hooks';
import { useHomeContext } from '../HomeContext';
import { setToChecked, setToAddress } from '../HomeContext/actions';
import { isChainAddress } from 'utils';
import { getNameByChainId } from 'utils/chain';
import { clearIcon, questionFilledIcon } from 'assets/images';
import styles from './styles.module.less';

const TextArea = Input.TextArea;

export default function CheckBoxInputRow() {
  const { toWallet, isHomogeneous } = useWallet();
  const [{ toChecked, toAddress }, { dispatch }] = useHomeContext();
  const { chainId } = toWallet || {};

  const [checked, setChecked] = useState<boolean>(!!toChecked);
  const [value, setValue] = useState<string>(toAddress || '');
  const { t } = useLanguage();
  const isMD = useMediaQueries('md');
  const InputEle = useMemo(() => (isMD ? TextArea : Input), [isMD]);

  const checkBoxInputRowStatus = useMemo(
    () => !!(toChecked && toAddress && !isChainAddress(toAddress, chainId)),
    [chainId, toAddress, toChecked],
  );

  const status = useMemo(() => (checkBoxInputRowStatus ? 'error' : undefined), [checkBoxInputRowStatus]);

  const onInputChange = useCallback((value: string) => dispatch(setToAddress(value)), [dispatch]);

  const clearValue = useCallback(() => {
    setValue('');
    onInputChange('');
  }, [onInputChange]);

  const networkName = chainId ? getNameByChainId(chainId) : '';

  if (isHomogeneous) {
    return null;
  }

  return (
    <div className={styles['check-input']}>
      <Row>
        <Checkbox
          className={styles['check-box']}
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);
            dispatch(setToChecked(e.target.checked));
          }}>
          <span className={clsx(styles['check-box-label-wrap'], 'flex-row-center')}>
            <span className={styles['check-box-label']}>{t('Send to another address manually')}</span>
            <Tooltip
              trigger="click"
              placement="topLeft"
              arrowPointAtCenter
              title={t('Choose this option if you wish to send to an address without connecting wallet.')}>
              <CommonImage className={styles['question-icon']} src={questionFilledIcon} />
            </Tooltip>
          </span>
        </Checkbox>
      </Row>
      {checked && (
        <Row className={styles['input-box']}>
          <InputEle
            className={clsx(styles['address-input'])}
            placeholder={t('Enter destination address placeholder', { networkName: networkName || '' })}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              onInputChange(e.target.value);
            }}
            maxLength={100}
            status={status}
          />
          {value && <CommonImage priority src={clearIcon} className={styles['clear-icon']} onClick={clearValue} />}
          {status === 'error' && <span className={styles['input-error']}>{t('input address error')}</span>}
        </Row>
      )}
    </div>
  );
}
