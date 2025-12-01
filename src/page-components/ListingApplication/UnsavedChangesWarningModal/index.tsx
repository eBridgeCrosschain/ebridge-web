import CommonModal, { ICommonModalProps } from 'components/CommonModal';
import CommonButton from 'components/CommonButton';
import styles from './styles.module.less';

type TUnsavedChangesWarningModalProps = Pick<ICommonModalProps, 'open' | 'onCancel' | 'onOk'>;

export default function UnsavedChangesWarningModal(props: TUnsavedChangesWarningModalProps) {
  return (
    <CommonModal
      {...props}
      className={styles['unsaved-changes-warning-modal']}
      title="Unsaved Changes Warning"
      width={377}>
      <p className={styles['unsaved-changes-warning-modal-text']}>
        Are you sure you want to go back? Any information you’ve entered will be lost.
      </p>
      <div className={styles['unsaved-changes-warning-modal-footer']}>
        <CommonButton className={styles['unsaved-changes-warning-modal-footer-button']} onClick={props.onCancel}>
          Cancel
        </CommonButton>
        <CommonButton
          className={styles['unsaved-changes-warning-modal-footer-button']}
          type="primary"
          onClick={props.onOk}>
          Confirm
        </CommonButton>
      </div>
    </CommonModal>
  );
}
