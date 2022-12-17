import { defineClientConfig } from "@vuepress/client";
import ChartJS from "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-md-enhance/lib/client/components/ChartJS.js";
import CodeTabs from "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-md-enhance/lib/client/components/CodeTabs.js";
import "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-md-enhance/lib/client/styles/container/index.scss";
import CodeDemo from "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-md-enhance/lib/client/components/CodeDemo.js";
import ECharts from "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-md-enhance/lib/client/components/ECharts.js";
import FlowChart from "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-md-enhance/lib/client/components/FlowChart.js";
import "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-md-enhance/lib/client/styles/footnote.scss";
import "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-md-enhance/lib/client/styles/image-mark.scss";
import "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-md-enhance/lib/client/styles/image-title.scss";
import Mermaid from "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-md-enhance/lib/client/components/Mermaid.js";
import Presentation from "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-md-enhance/lib/client/components/Presentation.js";
import Playground from "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-md-enhance/lib/client/components/Playground.js";
import Tabs from "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-md-enhance/lib/client/components/Tabs.js";
import "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-md-enhance/lib/client/styles/tasklist.scss";
import "/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-md-enhance/lib/client/styles/katex.scss";
import { defineAsyncComponent } from "vue";


export default defineClientConfig({
  enhance: ({ app }) => {
    app.component("ChartJS", ChartJS);
    app.component("CodeTabs", CodeTabs);
    app.component("CodeDemo", CodeDemo);
    app.component("ECharts", ECharts);
    app.component("FlowChart", FlowChart);
    app.component("Mermaid", Mermaid);
    app.component("Presentation", Presentation);
    app.component("Playground", Playground);
    app.component("Tabs", Tabs);
    app.component("VuePlayground", defineAsyncComponent(() => import("/Users/cci/repository/nodefony/src/nodefony/bundles/monitoring-bundle/vuepress/node_modules/vuepress-plugin-md-enhance/lib/client/components/VuePlayground.js")));
        
  },
});
