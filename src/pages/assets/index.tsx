import dynamic from 'next/dynamic';

export default dynamic(() => import('page-components/Assets'), {
  ssr: false,
});
