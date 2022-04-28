<template>
<v-container fluid class="ma-0 pa-0">
  <iframe v-if="loaded" :src="iframe.src" :style="iframe.style" :height="iframe.style.height" :width="iframe.style.width" type="application/pdf" frameborder="0"></iframe>
</v-container>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'Graphigl',
  components: {},
  data() {
    return {
      loaded: false,
      iframe: {
        src: "/app/documentation/graphql",
        style: null,
        wrapperStyle: null,
      }
    }
  },
  mounted() {
    this.iframe.style = {
      /*position: 'absolute',*/
      width: "100%",
      height: window.innerHeight,
    }
    this.loaded = true
  }
}
</script>
