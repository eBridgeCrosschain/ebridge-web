import dynamic from 'next/dynamic';

export default dynamic(() => import('page-components/MyApplication'), {
  ssr: false,
});