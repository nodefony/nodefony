import { defineUserConfig } from "vuepress";
import theme from "./theme.ts";

export default defineUserConfig({
  base: "/documentation/",
  dest: './public/documentation',
  locales: {
    "/": {
      lang: "en-US",
      title: "Nodefony",
      description: "Nodefony framewor",
    },
    "/fr/": {
      lang: "fr-FR",
      title: "Nodefony",
      description: "Nodefony framework",
    },
  },

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
