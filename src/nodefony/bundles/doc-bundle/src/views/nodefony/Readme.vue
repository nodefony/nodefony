<template>
<v-container class="overflow-auto">
  <Suspense>
    <n-readme :bundle="name" />
  </Suspense>
</v-container>
</template>

<script>
import {
  ref,
  toRefs
} from "vue";
import Readme from '@/views/readme.vue';
export default {
  name: 'NodefonyReadmeView',
  components: {
    'n-readme': Readme
  },
  props: {},
  data() {
    return {
      name: 'nodefony'
    }
  },
  setup(props) {

  },

  beforeMount() {

  },
  mounted() {

  },
  methods: {

  }
}
</script>


<style scoped lang="css">

</style>
