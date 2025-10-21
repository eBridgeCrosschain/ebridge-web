/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const filePath = path.resolve(
  __dirname,
  `../node_modules/@aelf-web-login/wallet-adapter-portkey-web/dist/esm/index.js`,
);

fs.readFile(filePath, 'utf-8', (err, data) => {
  if (err) throw err;
  let newData = data.replace(`import '@portkey/connect-web-wallet/dist/assets/index.css';`, '');
  fs.writeFile(filePath, newData, (err) => {
    if (err) throw err;
    console.log('The file has been updated');
  });
});
