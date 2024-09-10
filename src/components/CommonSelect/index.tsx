import { Select, SelectProps } from 'antd';
import clsx from 'clsx';
import React from 'react';
import CommonImage from 'components/CommonImage';
import { closeIcon, arrowIcon } from 'assets/images';
import styles from './styles.module.less';
export default function CommonSelect({ className, dropdownClassName, ...props }: SelectProps) {
  return (
    <Select
      clearIcon={<CommonImage className={styles['icon']} src={closeIcon} />}
      suffixIcon={<CommonImage className={styles['icon']} src={arrowIcon} />}
      getPopupContainer={(triggerNode) => triggerNode}
      dropdownClassName={clsx(styles['select-dropdown'], dropdownClassName)}
      className={clsx(styles.select, className)}
      {...props}
    />
  );
}
