import { useMemo } from 'react';
import clsx from 'clsx';
import { Steps, StepsProps } from 'antd';
import PartialLoading from 'components/PartialLoading';
import { useMobile } from 'contexts/useStore/hooks';
import styles from './styles.module.less';

export interface ICommonStepsProps extends Omit<StepsProps, 'labelPlacement' | 'size' | 'items'> {
  stepItems: (Required<StepsProps>['items'][number] & { isLoading?: boolean })[];
  hideLine?: boolean;
}

export default function CommonSteps({
  className,
  stepItems,
  current,
  direction,
  hideLine = false,
  ...props
}: ICommonStepsProps) {
  const isMobile = useMobile();

  const stepDirection = useMemo(() => {
    const _default = isMobile ? 'vertical' : 'horizontal';
    return direction || _default;
  }, [direction, isMobile]);

  const stepDirectionClassName = useMemo(() => {
    return stepDirection === 'vertical' ? styles['common-steps-vertical'] : styles['common-steps-horizontal'];
  }, [stepDirection]);

  const stepItemsWithIcon = stepItems?.map(({ isLoading, ...item }) => ({
    ...item,
    icon: isLoading ? <PartialLoading className={styles['common-steps-loading']} /> : undefined,
  }));

  return (
    <Steps
      {...props}
      className={clsx(
        stepDirectionClassName,
        styles['common-steps'],
        styles['common-steps-weight'],
        hideLine && styles['common-steps-hide-line'],
        className,
      )}
      direction={stepDirection}
      labelPlacement={isMobile ? 'horizontal' : 'vertical'}
      size="small"
      items={stepItemsWithIcon}
      current={current}
    />
  );
}
