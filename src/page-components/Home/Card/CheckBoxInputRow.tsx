import { Checkbox, Input, Row } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import CommonPopover from 'components/CommonPopover';
import type { InputProps } from 'antd';
import { useLanguage } from 'i18n';
import { useCallback, useMemo, useState } from 'react';
import QuestionCircleOutlined from '@ant-design/icons/QuestionCircleOutlined';
import clsx from 'clsx';
import styles from './styles.module.less';
import useMediaQueries from 'hooks/useMediaQueries';
import { clearIcon } from 'assets/images';
import CommonImage from 'components/CommonImage';

const TextArea = Input.TextArea;

export interface CheckBoxInputProps {
  checked?: boolean;
  value?: string;
  onCheckStatusTrigger?: (e: CheckboxChangeEvent) => void;
  onInputChange?: (e: any) => void;
  className?: InputProps['className'];
  maxLength?: number;
  status?: 'error' | undefined;
}

export default function CheckBoxInputRow({
  checked: propsChecked,
  value: propsValue,
  onCheckStatusTrigger,
  onInputChange,
  maxLength = 100,
  status,
}: CheckBoxInputProps) {
  const [checked, setChecked] = useState<boolean>(!!propsChecked);
  const [value, setValue] = useState<string>(propsValue || '');
  const { t } = useLanguage();
  const isXS = useMediaQueries('xs');
  const isMD = useMediaQueries('md');
  const InputEle = useMemo(() => (isXS || isMD ? TextArea : Input), [isXS, isMD]);

  const clearValue = useCallback(() => {
    setValue('');
    onInputChange?.('');
  }, [onInputChange]);

  return (
    <div className={styles['check-input']}>
      <Row align="middle">
        <Checkbox
          className={styles['check-box']}
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);
            onCheckStatusTrigger?.(e);
          }}>
          <span className={styles['check-box-label']}>
            {t("Initiate cross-chain transfer to the recipient's address")}
          </span>
        </Checkbox>
        <CommonPopover className="cursor-pointer" content="Your funds will be transferred to this address.">
          <QuestionCircleOutlined className={styles['help-icon']} />
        </CommonPopover>
      </Row>
      {checked && (
        <Row className={styles['input-box']}>
          <InputEle
            className={clsx(styles['address-input'])}
            placeholder="Destination address"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              onInputChange?.(e.target.value);
            }}
            maxLength={maxLength}
            status={status}
          />
          {value && <CommonImage priority src={clearIcon} className={styles['clear-icon']} onClick={clearValue} />}
          {status === 'error' && <span className={styles['input-error']}>{t('input address error')}</span>}
        </Row>
      )}
    </div>
  );
}
