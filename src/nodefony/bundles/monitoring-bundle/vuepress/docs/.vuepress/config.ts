import { defineUserConfig } from '@vuepress/cli';
import theme from './theme.js';

//const base = <'/' | `/${string}/`>process.env.BASE || '/';
const base = "/documentation/";

export default defineUserConfig({
  base,
  dest: './dist',
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Nodefony',
      description: 'Framework node.js',
    },
    '/fr/': {
      lang: 'fr-FR',
      title: "Nodefony",
      description: 'Framework node.js',
    },
  },
  theme,
  shouldPrefetch: false,
});
