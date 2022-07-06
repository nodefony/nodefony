<template>
<v-container fluid
             class="ma-0 pa-0">
	<!--iframe v-if="loaded && html" :srcdoc="html" :src="iframe.src" :sandbox="sandbox" :style="iframe.style" :height="iframe.style.height" :width="iframe.style.width" type="text/html" frameborder="0">
  </iframe-->
	<iframe v-if="loaded && html"
	        ref="iframe"
	        :sandbox="sandbox"
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
} from 'vuex';
export default {
	name: 'IframeSwagger',
	components: {},
	data() {
		return {
			loaded: false,
			html: null,
			sandbox: "allow-same-origin allow-forms allow-popups allow-scripts",
			iframe: {
				src: "/api/nodefony/swagger?urls.primaryName=login",
				style: null,
				wrapperStyle: null,
			}
		}
	},
	mounted() {
		this.iframe.style = {
			/*position: 'absolute',*/
			width: window.innerWidth,
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
			headers.append("jwt", this.token);
			return fetch(this.iframe.src, {
					credentials: 'include',
					method: 'get',
					headers
				})
				.then(async (response) => {
					this.html = await response.text()
					this.loaded = true

					this.$nextTick(() => {
						console.log(this.$refs)
						const content = this.$refs.iframe.contentWindow ||
							this.$refs.iframe.contentDocument.document ||
							this.$refs.iframe.contentDocument;
						console.log(content)
						content.document.open();
						content.document.write(this.html);
						content.document.close();

					})

					return response
				})
		}
	}
}
</script>
