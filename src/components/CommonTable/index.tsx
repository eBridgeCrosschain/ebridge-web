import { Table, TableProps } from 'antd';
import React from 'react';
import EmptyWallet from 'assets/images/empty-wallet.svg';
import Empty from 'assets/images/empty.svg';
import { useWallet } from 'contexts/useWallet/hooks';
import { Trans } from 'react-i18next';
import EmptyDataBox from 'components/EmptyDataBox';

export default function CommonTable(props: TableProps<any>) {
  const { fromWallet, toWallet } = useWallet();
  const isConnect = !(fromWallet?.account || toWallet?.account);
  return (
    <Table
      {...props}
      locale={{
        emptyText: () => {
          return (
            <EmptyDataBox
              imageSrc={isConnect ? EmptyWallet : Empty}
              text={
                !isConnect ? (
                  <Trans>No cross-chain records found.</Trans>
                ) : (
                  <>
                    <Trans>Connect2</Trans>
                    <Trans>wallet</Trans>
                    <Trans>to view transaction history</Trans>
                  </>
                )
              }
            />
          );
        },
      }}
    />
  );
}
