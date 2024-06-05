import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';

export default dynamic(() => import('page-components/Home'), {
  ssr: false,
  loading: () => <Skeleton paragraph={{ rows: 10 }} />,
});
