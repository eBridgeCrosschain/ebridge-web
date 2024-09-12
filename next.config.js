/* eslint-disable */
/** @type {import('next').NextConfig} */
const { NEXT_PUBLIC_PREFIX, ANALYZE, NODE_ENV } = process.env;
const withLess = require('next-with-less');
const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: ANALYZE === 'true',
});
const { rewriteConstants, getRewrites, rewriteEnv } = require('./rewriteENV');
rewriteEnv();
rewriteConstants();
const plugins = [
  [withBundleAnalyzer],
  [
    withLess,
    {
      lessLoaderOptions: {
        lessOptions: {
          modifyVars: {
            '@app-prefix': NEXT_PUBLIC_PREFIX,
            '@ant-prefix': NEXT_PUBLIC_PREFIX,
          },
        },
      },
    },
  ],
];

const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  // webpack(config) {
  //   config.resolve.alias['bn.js'] = path.resolve(process.cwd(), 'node_modules', 'bn.js');
  //   return config;
  // },
  compiler: {
    removeConsole: false,
  },
  async rewrites() {
    return getRewrites();
  },
  images: {
    domains: ['raw.githubusercontent.com'],
  },
};

const productionConfig = {
  ...nextConfig,
  swcMinify: false,
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
  experimental: {
    'react-use': {
      transform: 'react-use/lib/{{member}}',
    },
    lodash: {
      transform: 'lodash/{{member}}',
    },
  },
  resolve: {},
};

const withTM = require('next-transpile-modules')([
  'antd-mobile',
  '@aelf-web-login/wallet-adapter-base',
  '@aelf-web-login/wallet-adapter-react',
  '@aelf-web-login/wallet-adapter-bridge',
  '@portkey/did-ui-react'
]);

module.exports = withPlugins(
  plugins,
  ANALYZE === 'true' || process.env.NEXT_PUBLIC_APP_ENV === 'mainnet' ? withTM(productionConfig) : withTM(nextConfig),
);
