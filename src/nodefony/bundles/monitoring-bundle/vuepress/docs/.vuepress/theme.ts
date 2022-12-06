import { hopeTheme } from 'vuepress-theme-hope';
import { enNavbar, frNavbar } from './navbar/index.js';
import { enSidebar, frSidebar } from './sidebar/index.js';

const hostname =
  process.env.HOSTNAME || 'https://nodefony.net/documentation';

export default hopeTheme({
  hostname,
  author: {
    name: 'Christophe CAMENSULI',
    url: 'https://nodefony.net',
  },
  navbarLayout: {
      left: ["Brand"],
      center: ["Links"],
      right:["Language","Repo", "Outlook", "Search"]
      //right: ["Language", "Repo", "Outlook", "Search"],
  },
  iconAssets: 'fontawesome',
  logo: '/images/doc-logo.png',
  repo: 'nodefony/nodefony',
  pure: true,
  docsDir: 'src/nodefony/bundles/monitorings-bundle/vuepress/docs',
  pageInfo: ['Author', 'Original', 'Date', 'Category', 'Tag', 'ReadingTime'],
  locales: {
    lang:"en_EN",
    '/': {
      // navbar
      navbar: enNavbar,
      // sidebar
      sidebar: enSidebar,
      footer: 'Default footer',
      displayFooter: true,
      metaLocales: {
        editLink: 'Edit this page on GitHub',
      },
    },
    /**
     * Chinese locale config
     */
    '/fr/': {
      // navbar
      navbar: frNavbar,
      // sidebar
      sidebar: frSidebar,
      footer: 'pied de page',
      displayFooter: true,
      // page meta
      metaLocales: {
        editLink: 'editer cette page sur GitHub',
      },
    },
  },
  encrypt: {
    config: {
      //'/demo/encrypt.html': ['1234'],
      //'/fr/demo/encrypt.html': ['1234'],
    },
  },
  plugins: {
    // If you don’t need comment feature, you can remove following option
    // The following config is for demo ONLY, if you need comment feature, please generate and use your own config, see comment plugin documentation for details.
    // To avoid disturbing the theme developer and consuming his resources, please DO NOT use the following config directly in your production environment!!!!!

    // Disable features you don’t want here
    mdEnhance: {
      align: true,
      attrs: true,
      chart: true,
      codetabs: true,
      container: true,
      demo: true,
      echarts: true,
      flowchart: true,
      gfm: true,
      imageLazyload: true,
      imageTitle: true,
      imageSize: true,
      include: true,
      katex: true,
      mark: true,
      mermaid: true,
      playground: {
        presets: ['ts', 'vue'],
      },
      presentation: {
        plugins: ['highlight', 'math', 'search', 'notes', 'zoom'],
      },
      stylize: [
        {
          matcher: 'Recommended',
          replacer: ({ tag }) => {
            if (tag === 'em')
              return {
                tag: 'Badge',
                attrs: { type: 'tip' },
                content: 'Recommended',
              };
          },
        },
      ],
      sub: true,
      sup: true,
      tabs: true,
      vPre: true,
      vuePlayground: true,
    },

    pwa: {
      favicon: '/favicon.ico',
      cacheHTML: true,
      cachePic: true,
      appendBase: true,
      apple: {
        icon: '/img/icons/apple-icon-152x152.png',
        statusBarColor: 'black',
      },
      msTile: {
        image: '/img/icons/mstile-144x144.png',
        color: '#ffffff',
      },
      manifest: {
        icons: [
          {
            src: '/img/icons/android-chrome-512x512.png',
            sizes: '512x512',
            purpose: 'maskable',
            type: 'image/png',
          },
          {
            src: '/img/icons/android-chrome-192x192.png',
            sizes: '192x192',
            purpose: 'maskable',
            type: 'image/png',
          },
          {
            src: '/img/icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/img/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
        shortcuts: [
          {
            name: 'Demo',
            short_name: 'Demo',
            url: '/demo/',
            icons: [
              {
                src: '/img/icons/guide-maskable.png',
                sizes: '192x192',
                purpose: 'maskable',
                type: 'image/png',
              },
              {
                src: '/img/icons/guide-monochrome.png',
                sizes: '192x192',
                purpose: 'monochrome',
                type: 'image/png',
              },
            ],
          },
        ],
      },
    },

    seo:
      hostname === 'https://vuepress-theme-hope.github.io'
        ? {}
        : { canonical: 'https://vuepress-theme-hope.github.io/docs-demo/' },
  },
});
