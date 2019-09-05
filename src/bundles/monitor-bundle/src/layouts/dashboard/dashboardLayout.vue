<template>
  <div class="wrapper">
    <side-bar>
      <template slot="links">
        <sidebar-link to="/dashboard"  icon="tim-icons icon-chart-pie-36"/>
      </template>
    </side-bar>
    <div class="main-panel">
      <top-navbar></top-navbar>
      <dashboard-content>
      </dashboard-content>
    </div>
  </div>
</template>

<style lang="scss">
</style>

<script>
import TopNavbar from './topNavBar.vue'
import DashboardContent from './content.vue'
export default {
  components: {
    TopNavbar,
    DashboardContent
  },
  methods: {
  }
}
</script>
