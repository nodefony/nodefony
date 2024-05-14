// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Vuetify
import {createVuetify} from "vuetify";
//import * as labs from "vuetify/lib/labs/components";

export default createVuetify({
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
  components: {
    //...labs
  },
  defaults: {
    VDataTable: {
      fixedHeader: true,
      noDataText: "Results not found"
    }
  }
});
