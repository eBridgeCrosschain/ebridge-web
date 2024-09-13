import { Table, TableProps } from 'antd';
import CommonImage from 'components/CommonImage';
import React from 'react';
import EmptyWallet from 'assets/images/empty-wallet.svg';
import Empty from 'assets/images/empty.svg';
import styles from './styles.module.less';
import clsx from 'clsx';
import { useWallet } from 'contexts/useWallet/hooks';
import { Trans } from 'react-i18next';
export default function CommonTable(props: TableProps<any>) {
  const { fromWallet, toWallet } = useWallet();
  const isConnect = !(fromWallet?.account || toWallet?.account);
  return (
    <Table
      {...props}
      locale={{
        emptyText: () => {
          return (
            <div className={clsx(styles.empty)}>
              <CommonImage priority src={isConnect ? EmptyWallet : Empty} className={styles.icon} />
              <div>
                {!isConnect ? (
                  <Trans>No cross-chain records found.</Trans>
                ) : (
                  <>
                    <Trans>Connect2</Trans>
                    <Trans>wallet</Trans>
                    <Trans>to view transaction history</Trans>
                  </>
                )}
              </div>
            </div>
          );
        },
      }}
    />
  );
}
