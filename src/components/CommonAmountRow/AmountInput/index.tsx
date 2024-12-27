import { Input, InputProps, Row } from 'antd';
import { useState } from 'react';
import { parseInputChange } from 'utils/input';
import { isValidPositiveNumber } from 'utils/reg';
import styles from './styles.module.less';
export default function AmountInput({ value: propsValue, onChange, className, maxLength }: InputProps) {
  const [value, setValue] = useState('');
  return (
    <Row className={styles['amount-input']}>
      <Input
        className={className}
        allowClear
        placeholder="0"
        maxLength={maxLength}
        value={propsValue !== undefined ? propsValue : value}
        onChange={(e) => {
          const { value } = e.target;
          if (value && !isValidPositiveNumber(value)) return;
          propsValue === undefined && setValue(parseInputChange(value));
          onChange?.(e);
        }}
      />
    </Row>
  );
}
