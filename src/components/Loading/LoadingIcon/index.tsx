import CommonImage from 'components/CommonImage';
import styles from './styles.module.less';
import { loadingIcon } from 'assets/images';

export function LoadingIcon() {
  return <CommonImage className={styles['loading-icon']} src={loadingIcon} />;
}
