import dynamic from 'next/dynamic';

export default dynamic(() => import('page-components/Transactions'), {
  ssr: false,
});
