import clsx from 'clsx';
import type { ImageProps } from 'next/image';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ChainId } from 'types';
import { getTokenLogoURL } from 'utils';
import styles from './styles.module.less';
import { useGetTokenInfoByWhitelist } from 'hooks/token';
const BAD_SRCS: { [src: string]: true } = {};

export default function TokenLogo({
  chainId,
  symbol,
  className,
  src,
  alt = 'logo',
  layout = 'fill',
  style,
  onClick,
  ...props
}: {
  style?: ImageProps['style'];
  layout?: ImageProps['layout'];
  alt?: string;
  src?: string;
  chainId?: ChainId;
  symbol?: string;
  className?: string;
  onClick?: ImageProps['onClick'];
}) {
  const getTokenInfoByWhitelist = useGetTokenInfoByWhitelist();
  const memoSrc = useMemo(() => {
    if (src) return src;
    return getTokenInfoByWhitelist(chainId, symbol)?.icon ?? getTokenLogoURL(symbol, chainId);
  }, [chainId, getTokenInfoByWhitelist, src, symbol]);
  const [, refresh] = useState<number>(0);
  const tmpSrc = BAD_SRCS[memoSrc] ? undefined : memoSrc;
  return (
    <div
      className={clsx(
        {
          [styles['token-logo']]: true,
          [styles['token-bad']]: !tmpSrc,
        },
        className,
      )}
      style={style}
      onClick={onClick}>
      {!tmpSrc ? (
        <span>{symbol?.[0]}</span>
      ) : (
        <Image
          {...props}
          onError={() => {
            if (memoSrc) BAD_SRCS[memoSrc] = true;
            refresh((i) => i + 1);
          }}
          src={memoSrc}
          layout={layout}
          alt={alt}
        />
      )}
    </div>
  );
}
