<template>
<v-container fluid
             class="ma-0 pa-0">
  <n-nodefony-loader v-if="!loaded" />
	<iframe v-else-if="html"
	        :srcdoc="html"
	        :style="style"
	        :height="iframe.style.height"
	        :width="iframe.style.width"
	        type="text/html"
	        frameborder="0"></iframe>
</v-container>
</template>

<script>
// @ is an alias to /src
import {
	mapGetters
} from 'vuex';
import NodefonyLoader from '@/views/loaders/loader'
export default {
	name: 'IframeAnalyser',
	components: {
    "n-nodefony-loader": NodefonyLoader
  },
  props:{
   bundle:{
     type:String,
     required:true
   }
  },
	data() {
		return {
			loaded: false,
			html: null
		}
	},
	mounted() {
		this.iframe.style = {
			/*position: 'absolute',*/
			width: "100%",
			height:"100vh",
		}
		this.loadIframe()
	},
	computed: {
		...mapGetters(['token']),
    iframe(){
      let src = `/documentation/webpackanalyser/${this.bundle}`
      return {
        src: src,
        style: null,
        wrapperStyle: null
      }
    },
    heigth(){
      return `calc(100vh - 64px)`
    },
    style(){
      return {
        width: "100%",
  			height:this.heigth,
      }
    }
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
