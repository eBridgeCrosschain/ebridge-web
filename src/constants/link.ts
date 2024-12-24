import {
  telegramIcon,
  twitterIcon,
  telegramDarkIcon,
  twitterDarkIcon,
  bridgeIcon,
  bridgeBlueIcon,
  transactionsIcon,
  transactionsBlueIcon,
  poolsIcon,
  poolsBlueIcon,
} from 'assets/images';
import { ListingStep } from './listingApplication';
import { getListingUrl } from 'utils/listingApplication';

export const ROUTE_PATHS = {
  HOME: '/',
  BRIDGE: '/bridge',
  TRANSACTIONS: '/transactions',
  TERMS_OF_SERVICE: '/terms-of-service',
  PRIVACY_POLICY: '/privacy-policy',
  LISTING_APPLICATION: '/listing-application',
  MY_APPLICATIONS: '/my-applications',
  POOLS: '/pools',
};

export const HIDE_MAIN_PAGE_LIST = [
  {
    icon: poolsIcon,
    selectedIcon: poolsBlueIcon,
    title: 'Pools',
    href: ROUTE_PATHS.POOLS,
  },
];

export const HIDE_BACKGROUND_IMAGE_PATH_LIST = [ROUTE_PATHS.LISTING_APPLICATION, ROUTE_PATHS.MY_APPLICATIONS];

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
  {
    icon: poolsIcon,
    selectedIcon: poolsBlueIcon,
    title: 'Pools',
    href: ROUTE_PATHS.POOLS,
  },
];

export const LISTING_MENU_CONFIG = [
  {
    label: 'Listing Application',
    link: getListingUrl(ListingStep.TOKEN_INFORMATION),
  },
  {
    label: 'My Applications',
    link: ROUTE_PATHS.MY_APPLICATIONS,
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

export const FOOTER_MENU_LIST_CONFIG = [
  {
    title: 'Listing',
    menu: LISTING_MENU_CONFIG,
  },
  {
    title: 'Legal',
    menu: LEGAL_MENU_CONFIG,
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

export const CONTACT_US_FORM_URL = 'https://form.ebridge.exchange/contact';
