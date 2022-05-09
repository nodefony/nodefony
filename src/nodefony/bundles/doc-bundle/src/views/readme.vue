<template>
<v-container fluid class="">
  <Markdown v-if="source" :source="source" :highlight="highlight" html breaks :anchor="{}" :emoji="{}" linkify />
</v-container>
</template>
<script>
import Markdown from 'vue3-markdown-it';
import {
  ref,
  toRefs
} from "vue";
export default {
  name: 'ReadmeView',
  components: {
    Markdown,
  },
  props: {
    bundle: String
  },
  data() {
    return {
      highlight: {
        auto: true
      }
    }
  },
  async setup(props) {
    const {
      bundle
    } = toRefs(props)

    const source = ref(null);
    const getReadme = async (bundle) => {
      const url = `/nodefony/documentation/${bundle}/readme`
      return fetch(url, {
          credentials: 'include',
          headers: {
            "Accept": 'application/json',
            "Content-Type": "application/json",
            "User-Agent": "nodefony"
          }
        })
        .then(async (response) => {
          try {
            if (response.ok) {
              return await response.json();
            }
          } catch (error) {
            error.response = response;
            throw error;
          }
          let error = new Error(response.statusText);
          error.response = await response.json();
          throw error;
        })
    }



    if (bundle.value) {
      const res = await getReadme(bundle.value)
      if (res.readme) {
        source.value = res.readme
      }
    }

    return {
      bundle,
      source
    }
  },
  beforeMount() {},
  mounted() {},
  methods: {}
}
</script>


<style scoped lang="scss">
@import 'highlight.js/styles/github-dark.css';
</style>
