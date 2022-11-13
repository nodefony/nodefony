import { navbar } from 'vuepress-theme-hope';
import { version } from '../version';

export const enNavbar = navbar([
  '/',
  { text: 'Demo', icon: 'discover', link: '/demo/' },
  {
    text: version,
    icon: 'note',
    children: [
      {
        text: 'V6 Docs',
        link: 'https://vuepress-theme-hope.github.io/v2/',
      }

    ],
  },
]);
