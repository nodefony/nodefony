<template>

<div class=" sidebar container-fluid h-100 pt-20" :data="backgroundColor">
    <div class="row h-100">
        <aside class="col-12 col-md-2 p-0 bg-dark">
            <nav class="navbar navbar-expand navbar-dark bg-dark flex-md-column flex-row align-items-start">
                <div class="collapse navbar-collapse">
                    <ul class="flex-md-column flex-row navbar-nav w-100 justify-content-between">
                        <li class="nav-item">
                            <a class="nav-link pl-0" href="#">Link</a>
                        </li>
                        ..
                    </ul>
                </div>
            </nav>
        </aside>
        <main class="col">
            ..
        </main>
    </div>
</div>
</template>
<script>
import SidebarLink from './SidebarLink'

export default {
  props: {
    title: {
      type: String,
      default: 'Monitor'
    },
    backgroundColor: {
      type: String,
      default: 'vue'
    },
    activeColor: {
      type: String,
      default: 'success',
      validator: value => {
        let acceptedValues = [
          'primary',
          'info',
          'success',
          'warning',
          'danger'
        ]
        return acceptedValues.indexOf(value) !== -1
      }
    },
    sidebarLinks: {
      type: Array,
      default: () => []
    },
    autoClose: {
      type: Boolean,
      default: true
    }
  },
  provide () {
    return {
      autoClose: this.autoClose,
      addLink: this.addLink,
      removeLink: this.removeLink
    }
  },
  components: {
    SidebarLink
  },
  computed: {
    /**
     * Styles to animate the arrow near the current active sidebar link
     * @returns {{transform: string}}
     */
    arrowMovePx () {
      return this.linkHeight * this.activeLinkIndex
    },
    shortTitle () {
      return this.title.split(' ')
        .map(word => word.charAt(0))
        .join('').toUpperCase()
    }
  },
  data () {
    return {
      linkHeight: 65,
      activeLinkIndex: 0,
      windowWidth: 0,
      isWindows: false,
      hasAutoHeight: false,
      links: []
    }
  },
  methods: {
    findActiveLink () {
      this.links.forEach((link, index) => {
        if (link.isActive()) {
          this.activeLinkIndex = index
        }
      })
    },
    addLink (link) {
      const index = this.$slots.links.indexOf(link.$vnode)
      this.links.splice(index, 0, link)
    },
    removeLink (link) {
      const index = this.links.indexOf(link)
      if (index > -1) {
        this.links.splice(index, 1)
      }
    }
  },
  mounted () {
    this.$watch('$route', this.findActiveLink, {
      immediate: true
    })
  }
}
</script>
