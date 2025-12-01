import dynamic from 'next/dynamic';

export default dynamic(() => import('page-components/Pools/Pool'), {
  ssr: false,
});
