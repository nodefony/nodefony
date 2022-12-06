import { navbar } from 'vuepress-theme-hope';
import { version } from '../version';

export const enNavbar = navbar([
  '/',
  /*{ text: 'Hope', icon: 'discover', link: '/Hope/' },*/
  {
    text: version,
    icon: 'note',
    children: [
      {
        text: 'V6 Docs',
        link: '',
      }

    ],
  },
]);
