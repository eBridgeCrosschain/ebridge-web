import styles from './styles.module.less';
import clsx from 'clsx';
import Empty from 'assets/images/empty.svg';
import CommonImage from 'components/CommonImage';

export type TEmptyDataBoxProps = {
  imageSrc?: string;
  text?: React.ReactNode;
};

export default function EmptyDataBox({ imageSrc = Empty, text = 'No found' }: TEmptyDataBoxProps) {
  return (
    <div className={clsx(styles['empty-data-box'])}>
      <CommonImage priority src={imageSrc} className={styles['empty-data-box-icon']} />
      <div className={styles['empty-data-box-text']}>{text}</div>
    </div>
  );
}
