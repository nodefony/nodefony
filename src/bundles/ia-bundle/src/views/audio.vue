<template>
  <v-container fluid class=" " style="padding-top:130px">
    <div id="console" ref="console"></div>

    <v-card variant="outlined" width="900" height="800">

    </v-card>

  </v-container>
</template>

<script>
import { nextTick } from 'vue'
import speechCommand from "@/compositions/speech-command.js"

export default {
  name: 'Audio',
  components: {},
  data() {
    return {
      speechCommand: speechCommand(),
      predictions: null,
      console:null
    }
  },
  async beforeMount() {

  },
  async mounted() {
    this.console = this.$refs["console"]
    return this.run()
  },
  computed: {},
  methods: {
    run(){
      return this.speechCommand.run()
      .then((scores) => {
        console.log("webaudio api   ", scores)
        this.console.textContent = scores[0].word;
        return this.run()
      })
    },
  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>