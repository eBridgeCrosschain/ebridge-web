import {
  telegramIcon,
  twitterIcon,
  telegramDarkIcon,
  twitterDarkIcon,
  bridgeIcon,
  bridgeBlueIcon,
  transactionsIcon,
  transactionsBlueIcon,
} from 'assets/images';

export const ROUTE_PATHS = {
  BRIDGE: '/bridge',
  TRANSACTIONS: '/transactions',
  TERMS_OF_SERVICE: '/terms-of-service',
  PRIVACY_POLICY: '/privacy-policy',
};

export const NAV_LIST = [
  {
    icon: bridgeIcon,
    selectedIcon: bridgeBlueIcon,
    title: 'Bridge',
    href: ROUTE_PATHS.BRIDGE,
  },
  {
    icon: transactionsIcon,
    selectedIcon: transactionsBlueIcon,
    title: 'Transactions',
    href: ROUTE_PATHS.TRANSACTIONS,
  },
];

export const LEGAL_MENU_CONFIG = [
  {
    label: 'Terms of Service',
    link: ROUTE_PATHS.TERMS_OF_SERVICE,
  },
  {
    label: 'Privacy Policy',
    link: ROUTE_PATHS.PRIVACY_POLICY,
  },
];

const COMMUNITY_LINK_MAP = {
  TELEGRAM: 'https://t.me/eBridge_official',
  TWITTER: 'https://x.com/eBridge_Web3',
  DISCORD: 'https://discord.com/invite/MCSP56WV',
};

export const FOOTER_COMMUNITY_CONFIG = [
  {
    label: 'Telegram',
    icon: telegramIcon,
    link: COMMUNITY_LINK_MAP.TELEGRAM,
  },
  {
    label: 'Twitter',
    icon: twitterIcon,
    link: COMMUNITY_LINK_MAP.TWITTER,
  },
];

export const HEADER_COMMUNITY_CONFIG = [
  {
    label: 'Telegram',
    icon: telegramDarkIcon,
    link: COMMUNITY_LINK_MAP.TELEGRAM,
  },
  {
    label: 'X (Twitter)',
    icon: twitterDarkIcon,
    link: COMMUNITY_LINK_MAP.TWITTER,
  },
];
