import dynamic from 'next/dynamic';

const Network = dynamic(import('./Network'), {
  ssr: false,
});
export default Network;
