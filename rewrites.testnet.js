const host = 'https://test.ebridge.exchange';
module.exports = [
  { source: '/api/:path*', destination: `${host}/api/:path*` },
  { source: '/cms/:path*', destination: `https://test-cms.ebridge.exchange/:path*` },
  { source: '/AElfIndexer_eBridge/:path*', destination: `http://172.31.11.5:7022/AElfIndexer_eBridge/:path*` },
];
