import { sidebar } from 'vuepress-theme-hope';

export const enSidebar = sidebar({
  '/': ['',
    {
      icon: 'cubes',
      text: 'readme',
      prefix: 'readme/',
      link: 'nodefony/',
      children: 'structure',
    },
    {
      icon: 'discover',
      text: 'Hope',
      prefix: 'hope/',
      link: 'hope/',
      children: 'structure',
    }
  ],
});
