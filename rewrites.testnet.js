const host = 'https://test.ebridge.exchange';
module.exports = [
  { source: '/api/:path*', destination: `${host}/api/:path*` },
  { source: '/cms/:path*', destination: `https://test-cms.ebridge.exchange/:path*` },
  {
    source: '/AElfIndexer_eBridge/:path*',
    destination: `https://test-indexer.ebridge.exchange/AElfIndexer_eBridge/:path*`,
  },
];
