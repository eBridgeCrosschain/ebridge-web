import { Button } from 'antd';
import type { ButtonProps } from 'antd/lib/button/button';
import clsx from 'clsx';
import React from 'react';
import styles from './styles.module.less';
// declare const ButtonTypes: ['default', 'primary', 'ghost', 'dashed', 'link', 'text', 'select'];
type ButtonTypes = 'default' | 'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'select';

interface CommonButtonProps {
  type?: (typeof ButtonTypes)[number];
  children?: React.ReactNode;
  icon?: React.ReactNode;
  shape?: ButtonProps['shape'];
  size?: ButtonProps['size'];
  disabled?: boolean;
  loading?:
    | boolean
    | {
        delay?: number;
      };
  prefixCls?: string;
  className?: string;
  ghost?: boolean;
  danger?: boolean;
  block?: boolean;
  onClick?: ButtonProps['onClick'];
}
export default function CommonButton({ className, type, ...props }: CommonButtonProps) {
  let c = '';
  let btnType = type;
  if (type === 'select') {
    c = styles['select-btn'];
    btnType = undefined;
  }
  return <Button type={btnType as ButtonProps['type']} className={clsx(c, className)} {...props} />;
}
