import { ROUTE_PATHS } from 'constants/link';

export async function getServerSideProps() {
  return {
    redirect: {
      destination: ROUTE_PATHS.BRIDGE,
      permanent: false,
    },
  };
}

const IndexPage = () => null;

export default IndexPage;
