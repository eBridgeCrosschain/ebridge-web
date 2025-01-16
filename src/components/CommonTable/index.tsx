import { Table, TableProps } from 'antd';
import React, { useMemo } from 'react';
import EmptyWallet from 'assets/images/empty-wallet.svg';
import Empty from 'assets/images/empty.svg';
import { useWallet } from 'contexts/useWallet/hooks';
import { Trans } from 'react-i18next';
import EmptyDataBox from 'components/EmptyDataBox';

export default function CommonTable(props: TableProps<any> & { emptyText?: React.ReactNode }) {
  const { fromWallet, toWallet } = useWallet();
  const isConnect = !(fromWallet?.account || toWallet?.account);
  const defaultEmptyText = useMemo(() => {
    return !isConnect ? (
      <Trans>No cross-chain records found.</Trans>
    ) : (
      <>
        <Trans>Connect2</Trans>
        <Trans>wallet</Trans>
        <Trans>to view transaction history</Trans>
      </>
    );
  }, [isConnect]);

  return (
    <Table
      {...props}
      locale={{
        emptyText: () => {
          return (
            <EmptyDataBox imageSrc={isConnect ? EmptyWallet : Empty} text={props?.emptyText || defaultEmptyText} />
          );
        },
      }}
    />
  );
}
