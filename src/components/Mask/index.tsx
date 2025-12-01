import CommonImage from 'components/CommonImage';
import { useLanguage } from 'i18n';
import warnIcon from './images/warning_6.svg';
import upgradeImg from './images/upgrade.svg';
import styles from './styles.module.less';
import useMediaQueries from 'hooks/useMediaQueries';

export default function Mask() {
  const { t } = useLanguage();
  const isMd = useMediaQueries('md');
  return (
    <div className={styles['unique-mask']}>
      <div className={styles['content']}>
        <div className={styles['notice-title']}>
          <CommonImage priority src={warnIcon} className={styles['warn-icon']} />
          <h1>{t('Upgrade Title')}</h1>
        </div>
        {Object.values(t('Upgrade Notice', { returnObjects: true })).map((ele: any, idx: number) => {
          return (
            <section key={idx}>
              {Array.isArray(ele)
                ? ele.map((segment, segIdx) => {
                    return <p key={segIdx}>{segment}</p>;
                  })
                : ele}
            </section>
          );
        })}
      </div>
      {isMd ? <div /> : <CommonImage src={upgradeImg} className={styles['upgrade-img']} />}
    </div>
  );
}
