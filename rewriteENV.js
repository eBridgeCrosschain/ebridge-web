/* eslint-disable */
const path = require('path');
const fs = require('fs');

function rewriteConstants() {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'testnet';
  const IS_MAINNET = appEnv === 'mainnet';
  const constantsPath = path.resolve(__dirname, `./src/constants/index.ts`);
  fs.writeFileSync(
    constantsPath,
    `export const IS_MAINNET = ${IS_MAINNET};\n
export * from './${appEnv}';\n`,
  );
}

function getRewrites() {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'testnet';
  return require(`./rewrites.${appEnv}`);
}

function rewriteEnv() {
  const name = process.env.ENV_NAME;
  try {
    const data = fs.readFileSync(`.env.${name}.local`, 'utf8');
    data.split('\n').forEach(function (item) {
      const [key, value] = item.split('=');
      process.env[key.trim()] = value.trim();
    });
  } catch (error) {
    console.log(`Failed to load environment variables from file ${name}`);
  }
}

exports.rewriteConstants = rewriteConstants;
exports.getRewrites = getRewrites;
exports.rewriteEnv = rewriteEnv;
