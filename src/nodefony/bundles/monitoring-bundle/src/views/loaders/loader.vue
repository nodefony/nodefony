<template>
  <v-container style="height: 400px;">
    <v-row class="fill-height"
           align-content="center"
           justify="center">
      <v-row class="text-subtitle-1 text-center">
        <v-img class=""
               width="100"
               height="91"
               :src="nodefony.logo" />

      </v-row>
      <v-col class="text-subtitle-1 text-center"
             cols="12">
        {{title}}
      </v-col>
      <v-col cols="6">
        <v-progress-linear color="deep-purple accent-4"
                           indeterminate
                           rounded
                           height="6">
        </v-progress-linear>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  name: "Nloader",
  components: {
  },
  inject: ["nodefony"],
  props: {
    name: {
      type: String,
      default: "Nodefony"
    },
    title: {
      type: String,
      default: "Getting Nodefony Monitoring"
    }
  },
  data () {
    return {
    };
  },
  computed: {},
  beforeMount () {},
  mounted () {},
  methods: {}
};
</script>
