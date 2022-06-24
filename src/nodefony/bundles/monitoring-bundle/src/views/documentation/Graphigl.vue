<template>
<v-container fluid class="ma-0 pa-0">
  <iframe v-if="loaded && html" :srcdoc="html" :style="iframe.style" :height="iframe.style.height" :width="iframe.style.width" type="text/html" frameborder="0"></iframe>
</v-container>
</template>

<script>
// @ is an alias to /src
import {
  mapGetters
} from 'vuex';
export default {
  name: 'IframeGraphigl',
  components: {},
  data() {
    return {
      loaded: false,
      html: null,
      iframe: {
        src: "/api/nodefony/graphql",
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
    this.loadIframe()

  },
  computed: {
    ...mapGetters(['token']),
  },
  methods: {
    loadIframe() {
      const headers = new Headers();
      headers.append("User-Agent", "nodefony");
      headers.append("jwt", this.token);
      return fetch(this.iframe.src, {
          credentials: 'include',
          method: 'get',
          headers
        })
        .then(async (response) => {
          this.html = await response.text()
          this.loaded = true
        })
    }
  }

}
</script>
