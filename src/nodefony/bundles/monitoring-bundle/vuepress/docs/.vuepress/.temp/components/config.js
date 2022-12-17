import { defineClientConfig } from "@vuepress/client";
import { h } from "vue";

import { useScriptTag } from "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-components/lib/client/vueuse.js";
import Badge from "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-components/lib/client/components/Badge.js";
import FontIcon from "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-components/lib/client/components/FontIcon.js";
import BackToTop from "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-components/lib/client/components/BackToTop.js";


export default defineClientConfig({
  enhance: ({ app }) => {
    app.component("Badge", Badge);
    app.component("FontIcon", FontIcon);
    
  },
  setup: () => {
    useScriptTag(`https://kit.fontawesome.com/ca37c296c5.js`);
    
  },
  rootComponents: [
    () => h(BackToTop, { threshold: 300 }),
    
  ],
});
