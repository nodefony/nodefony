<style>

#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}

</style>

<template>

<div id="app">
    <h1 class='success'>
      <img class='displayed' src='/framework-bundle/images/nodefony-logo.png'>
      <strong style='font-size:45px'>NODEFONY</strong>
    <p>
      <Home msg="Welcome to Your Vue.js App"/>
    </p>

  </h1>
</div>

</template>

<script>

import Home from './components/home.vue'

export default {
    name: 'app',
    components: {
        Home
    }
}

</script>
