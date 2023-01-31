<template>
  <v-card flat>

    <v-container class="overflow-auto">
      <vue-json-pretty :path="name"
                       :data="config"
                       @click="handleClick"> </vue-json-pretty>
      <!--v-list density="compact">
			<v-list-item v-for="(item, key) in config"
			             density="compact"
			             :key="key">
				<v-list-item-header>
					<v-list-item-title>{{key}} : </v-list-item-title>
				</v-list-item-header>:<wbr>
				<v-list-item-subtitle>{{item}}</v-list-item-subtitle>
			</v-list-item>
		</v-list-->
    </v-container>
  </v-card>
</template>


<script>
import {
  computed,
  reactive,
  ref,
  toRefs
} from "vue";

import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

export default {
  name: "n-bundle-config",
  components: {
    VueJsonPretty
  },
  props: {
    config: {
      type: Object,
      default: null
    },
    name: {
      type: String,
      required: true
    }
  },
  data () {
    return {

    };
  },
  computed: {

  },


  beforeMount () {

  },
  mounted () {

  },
  methods: {
    handleClick (ele) {
      console.log(ele);
    }
  }
};
</script>


<style scoped lang="scss">

</style>
