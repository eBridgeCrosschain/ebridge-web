import { telegramIcon, twitterIcon } from 'assets/images';

export const FOOTER_MENU_CONFIG = [
  {
    title: 'Legal',
    links: [
      {
        name: 'Terms of Service',
        link: '/teamOfService',
      },
      {
        name: 'Privacy Policy',
        link: '/privacyPolicy',
      },
    ],
  },
];

export const FOOTER_COMMUNITY_CONFIG = [
  {
    name: 'Telegram',
    icon: telegramIcon,
    link: 'https://t.me/eBridge_official',
  },
  {
    name: 'Twitter',
    icon: twitterIcon,
    link: 'https://x.com/eBridge_Web3',
  },
];
