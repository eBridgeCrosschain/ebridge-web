const host = 'https://ebridge.exchange';
module.exports = [
  { source: '/api/:path*', destination: `${host}/api/:path*` },
  { source: '/cms/:path*', destination: `https://cms.ebridge.exchange/:path*` },
  {
    source: '/AElfIndexer_eBridge/:path*',
    destination: `https://dapp-indexer.ebridge.exchange/AElfIndexer_eBridge/:path*`,
  },
];
