import GoogleAnalytics from 'components/GoogleAnalytics';
import Head from 'next/head';
import React from 'react';
export type DefaultHeadProps = { title?: string; description?: string };

export default function PageHead(props: DefaultHeadProps) {
  return (
    <>
      <GoogleAnalytics id={process.env.NEXT_PUBLIC_ANALYTICS_ID} />
      <DefaultHead {...props} />
    </>
  );
}

export function DefaultHead({
  title = 'eBridge: Cross-chain Bridge',
  description = 'Web3 cross-chain bridge that facilitates seamless token transfer between the aelf blockchain and Ethereum Virtual Machine (EVM) compatible networks.',
}: DefaultHeadProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta
        name="viewport"
        content="width=device-width,height=device-height,inital-scale=1.0,maximum-scale=1.0,user-scalable=no;"
      />
      <meta name="description" content={description || title} />
      <meta name="keywords" content="crosschain,blockchain,crypto,transaction,bridge,interoperability" />
    </Head>
  );
}
