<template>
<v-container fluid class="">
  <Markdown :source="source" />

  <div class="mermaid">
    {{data}}
  </div>

  <div class="mermaid">
    {{data2}}
  </div>
</v-container>
</template>
<script>
import Markdown from 'vue3-markdown-it';
import mermaid from "mermaid";
export default {
  name: 'HomeView',
  components: {
    Markdown,
  },

  setup() {

  },
  data() {
    return {
      source: '# Hello World!',
      defaultConfig: {
        theme: "default",
        startOnLoad: false,
        securityLevel: "loose"
      },
      data: `
      classDiagram
        Animal <|-- Duck
        Animal <|-- Fish
        Animal <|-- Zebra
        Animal : +int age
        Animal : +String gender
        Animal: +isMammal()
        Animal: +mate()
        class Duck{
            +String beakColor
            +swim()
            +quack()
        }
        class Fish{
            -int sizeInFeet
            -canEat()
        }
        class Zebra{
            +bool is_wild
            +run()
        }
      `,
      data2: `
      sequenceDiagram
        autonumber
        Alice->>John: Hello John, how are you?
        loop Healthcheck
            John->>John: Fight against hypochondria
        end
        Note right of John: Rational thoughts!
        John-->>Alice: Great!
        John->>Bob: How about you?
        Bob-->>John: Jolly good!
      `
    }
  },
  beforeMount() {
    mermaid.initialize(this.defaultConfig);
  },
  mounted() {
    mermaid.init()
  },
  methods: {
    editNode(nodeId) {
      alert(nodeId);
    }
  }
}
</script>
