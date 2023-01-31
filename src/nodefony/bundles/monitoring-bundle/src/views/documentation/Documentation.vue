<template>
  <v-container fluid
               class="ma-0 pa-0">
    <n-nodefony-loader v-if="!loaded" />
    <iframe v-if="iframe"
            :src="iframe.src"
            :style="iframe.style"
            :height="iframe.style.height"
            :width="iframe.style.width"
            type="text/html"
            frameborder="0">
    </iframe>
  </v-container>
</template>

<script>
// @ is an alias to /src
import {
  mapGetters
} from "vuex";
import NodefonyLoader from "@/views/loaders/loader";
export default {
  name: "IframeVuepress",
  components: {
    "n-nodefony-loader": NodefonyLoader
  },
  props: {
    path: {
      type: String
      // required:true
    }
  },
  data () {
    return {
      loaded: true,
      html: null,
      iframe: {
        src: "/documentation",
        style: {
          width: "100%",
          height: "calc(100vh - 64px)"
        }
      }
    };
  },
  mounted () {
    this.loaded = true;
  },
  computed: {
    ...mapGetters(["token"])
  },
  methods: {
    loadIframe () {
      const headers = new Headers();
      headers.append("User-Agent", "nodefony");
      headers.append("jwt", this.token);
      return fetch(this.iframe.src, {
        credentials: "include",
        method: "get",
        headers
      })
        .then(async (response) => {
          this.html = await response.text();
          console.log(this.html);
          this.loaded = true;
        });
    }
  }

};
</script>
