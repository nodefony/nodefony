<template>
<v-container fluid class="ma-0 pa-0 fill-height">
  <div ref="deck1" class="reveal">
    <div class="slides">

      <section>
        <img data-src="/app/images/app-logo.png">
        <h1>Nodefony<sup>®</sup></h1>
        <img width="200px" height="123px" data-src="/framework-bundle/images/nodejs/nodejs-new-pantone-black.png" />
        <h5 class="nodefony-grey" style="text-align:center">
          Framework Web Fullstack
        </h5>
        <h5 class="nodefony-grey" style="text-align:center">
          Micro Services
        </h5>
      </section>

      <section>
        <v-card class="mx-auto" max-width="400">
          <v-img class="align-end text-white" height="200" src="https://cdn.vuetifyjs.com/images/cards/docks.jpg" cover>
            <v-card-title>Top 10 Australian beaches</v-card-title>
          </v-img>

          <v-card-subtitle class="pt-4">
            Number 10
          </v-card-subtitle>

          <v-card-text>
            <div>Whitehaven Beach</div>

            <div>Whitsunday Island, Whitsunday Islands</div>
          </v-card-text>

          <v-card-actions>
            <v-btn color="orange">
              Share
            </v-btn>

            <v-btn color="orange">
              Explore
            </v-btn>
          </v-card-actions>
        </v-card>

      </section>

      <section style="text-align: initial;">
        <pre><code data-trim data-noescape data-line-numbers="3,8-10">
          {{code}}
        </code></pre>
      </section>

      <section>
        <h2>The Lorenz Equations</h2>
        \[\begin{aligned}
        \dot{x} &amp; = \sigma(y-x) \\
        \dot{y} &amp; = \rho x - y - xz \\
        \dot{z} &amp; = -\beta z + xy
        \end{aligned} \]
      </section>

      <section>
        Single Horizontal Slide
      </section>

      <section>
        <section>Vertical Slide 1</section>
        <section>Vertical Slide 2</section>
      </section>


      <section data-background-iframe="/app/documentation/graphql" data-background-interactive>
      </section>

      <section data-background-iframe="/app/documentation/swagger?urls.primaryName=login" data-background-interactive>
        <h2>swagger Api</h2>
      </section>

      <section data-background-iframe="https://www.youtube.com/embed/HgzGwKwLmgM?rel=0" data-background-interactive>
      </section>


      <section data-autoslide="2000">
        <p>After 2 seconds the first fragment will be shown.</p>
        <p class="fragment" data-autoslide="10000">After 10 seconds the next fragment will be shown.</p>
        <p class="fragment">Now, the fragment is displayed for 2 seconds before the next slide is shown.</p>
      </section>


      <section data-background-image="/app/images/app-logo.png">
        <h2>Image</h2>
      </section>

      <section data-background-image="/app/images/app-logo.png" data-background-size="100px" data-background-repeat="repeat">
        <h2>This background image will be sized to 100px and repeated</h2>
      </section>

      <section data-background-video="/doc-bundle/videos/oceans-clip.webm" data-background-video-loop data-background-video-muted>
        <h2>Video</h2>
      </section>

      <section data-transition="zoom">
        <h2>This slide will override the presentation transition and zoom!</h2>
      </section>

      <section data-transition-speed="fast">
        <h2>Choose from three transition speeds: default, fast or slow!</h2>
      </section>


      <section data-transition="slide">
        The train goes on …
      </section>
      <section data-transition="slide">
        and on …
      </section>
      <section data-transition="slide-in fade-out">
        and stops.
      </section>
      <section data-transition="fade-in slide-out">
        (Passengers entering and leaving)
      </section>
      <section data-transition="slide">
        And it starts again.
      </section>


      <section>
        <img data-src="/app/images/app-logo.png" style="background:white">
        <iframe data-src="/doc-bundle/videos/oceans-clip.webm"></iframe>
      </section>

      <section>
        <p class="fragment grow">grow</p>
        <p class="fragment shrink">shrink</p>
        <p class="fragment fade-out">fade-out</p>
        <p class="fragment fade-up">fade-up (also down, left and right!)</p>
        <p class="fragment fade-in-then-out">fades in, then out when we move to the next step</p>
        <p class="fragment fade-in-then-semi-out">fades in, then obfuscate when we move to the next step</p>
        <p class="fragment highlight-current-blue">blue only once</p>
        <p class="fragment highlight-red">highlight-red</p>
        <p class="fragment highlight-green">highlight-green</p>
        <p class="fragment highlight-blue">highlight-blue</p>
      </section>

      <section>
        Appear
        <p class="fragment" data-fragment-index="3">Appears last</p>
        <p class="fragment" data-fragment-index="1">Appears first</p>
        <p class="fragment" data-fragment-index="2">Appears second</p>
      </section>


      <section style="text-align: initial;" data-markdown="/doc-bundle/slides/README.md" data-separator="^\n\n\n" data-separator-vertical="^\n\n" data-separator-notes="^Note:" data-charset="utf-8">
        <!--
        Note that Windows uses `\r\n` instead of `\n` as its linefeed character.
        For a regex that supports all operating systems, use `\r?\n` instead of `\n`.
    -->
      </section>

      <section>
        <h2>Some Slide</h2>
        <aside class="notes">
          Oh hey, these are some notes. They'll be hidden in your presentation, but you can see them if you open the speaker notes window (hit »S« on your keyboard).
        </aside>
      </section>


      <section data-markdown>
        <textarea data-template>
          ## Slide 1
          A paragraph with some text and a [link](https://nodefony.net).
          ---
          ## Slide 2
          ---
          ## Slide 3
        </textarea>
      </section>

      <section>
        <h2>This video will use up the remaining space on the slide</h2>
        <video data-autoplay src="/doc-bundle/videos/oceans-clip.webm">
        </video>
      </section>

    </div>
  </div>
</v-container>
</template>

<script>
// @ is an alias to /src

import {
  ref
} from 'vue'
import Reveal from 'reveal.js';
import Markdown from 'reveal.js/plugin/markdown/markdown.js';
import RevealHighlight from 'reveal.js/plugin/highlight/highlight.js';
import RevealMath from 'reveal.js/plugin/math/math.js';
import RevealNotes from 'reveal.js/plugin/notes/notes.js';
//console.log(RevealNotes)

/*import 'highlight.js/lib/common';
import hljsVuePlugin from "@highlightjs/vue-plugin";*/

export default {
  name: 'RevealPresent',
  components: {
    //highlightjs: hljsVuePlugin.component
  },
  setup() {
    const deck1 = ref('deck1')
    const mywindow = ref(window.innerHeight)
    return {
      deck1,
      mywindow
    }
  },
  data() {
    return {
      reveal: null,
      code: `
$ la -l
total 3432
-rw-r--r--     1 cci  staff      331  5 mar 11:28 .editorconfig
-rw-r--r--     1 cci  staff      636  5 mar 11:28 .env-cmdrc.js
drwxr-xr-x    12 cci  staff      384  5 mar 11:35 .git
-rw-r--r--     1 cci  staff      450  5 mar 11:28 .gitignore
-rw-r--r--     1 cci  staff      643  5 mar 11:28 .jshintrc
-rw-r--r--     1 cci  staff     2430  5 mar 11:28 README.md
drwxr-xr-x     5 cci  staff      160  5 mar 11:28 bin
drwxr-xr-x     5 cci  staff      160  5 mar 11:28 config
drwxr-xr-x     2 cci  staff       64  5 mar 11:28 dist
drwxr-xr-x  1562 cci  staff    49984  5 mar 11:46 node_modules
-rw-r--r--     1 cci  staff  1006407  5 mar 11:31 package-lock.json
-rw-r--r--     1 cci  staff     1934  5 mar 11:31 package.json
drwxr-xr-x     6 cci  staff      192  5 mar 11:28 src
drwxr-xr-x     3 cci  staff       96  5 mar 11:28 tests
drwxr-xr-x     3 cci  staff       96  5 mar 11:32 tmp
      `
    }
  },
  computed: {
    height() {
      return this.mywindow
    },
    width() {
      return "100%"
    }
  },
  async mounted() {
    this.reveal = new Reveal(this.deck1, {
      plugins: [Markdown, RevealHighlight, RevealMath.KaTeX, RevealNotes],
      //embedded: true,
      //keyboardCondition: 'focused' // only react to keys when focused
    });
    await this.reveal.initialize({
        controls: true,
        controlsBackArrows: 'faded',
        progress: true,
        history: true,
        //center: false,
        slideNumber: true,
        showSlideNumber: 'speaker',
        transition: 'slide',
        markdown: {
          gfm: true,
          tables: true,
          breaks: true,
          //sanitize: true,
          smartLists: true,
          smartypants: true,
          xhtml: true
        },
        width: "100%",
        height: "100%",
        postMessage: true,
        autoPlayMedia: true
      })
      .then(() => {})
  }
}
</script>

<style scoped >
@import 'highlight.js/styles/agate.css';
@import "reveal.js/dist/reveal.css"
</style>
