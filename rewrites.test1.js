const host = 'http://192.168.66.78:7030';
module.exports = [
  { source: '/api/:path*', destination: `${host}/api/:path*` },
  { source: '/cms/:path*', destination: `https://cms.ebridge.exchange/:path*` },
];
