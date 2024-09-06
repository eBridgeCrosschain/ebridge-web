import dynamic from 'next/dynamic';

export default dynamic(() => import('page-components/Home'), {
  ssr: false,
  // loading: () => <Skeleton paragraph={{ rows: 10 }} />,
});

// TODO:
// import { ROUTE_PATHS } from 'constants/link';

// export async function getServerSideProps() {
//   return {
//     redirect: {
//       destination: ROUTE_PATHS.BRIDGE,
//       permanent: false,
//     },
//   };
// }

// const IndexPage = () => null;

// export default IndexPage;
