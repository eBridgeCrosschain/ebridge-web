export const breakpointMap = {
  md: 799,
  xl: 1179,
};

export const media = {
  md: `(max-width: ${breakpointMap.md}px)`,
  xl: `(max-width: ${breakpointMap.xl}px)`,
};

export const mediaQueries = {
  md: `@media screen and ${media.md}`,
  xl: `@media screen and ${media.xl}`,
};
