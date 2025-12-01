import { ChainId } from 'types';
import { getExploreLink, shortenString } from 'utils';
import { isMobileDevices } from './isMobile';

export function getTXLink(txId: string, chainId: ChainId, shortenChars?: number) {
  const target = isMobileDevices() ? '_self' : '_blank';
  return (
    <a target={target} href={getExploreLink(txId, 'transaction', chainId)} rel="noreferrer">
      {shortenString(txId, shortenChars)}
    </a>
  );
}

export function openWithBlank(url: string): void {
  const newWindow = window.open(url, '_blank');
  if (newWindow) {
    newWindow.opener = null;
  }
}
