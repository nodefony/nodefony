<style scoped>

h3 {
    margin: 40px 0 0;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    display: inline-block;
    margin: 0 10px;
}

a {
    color: #42b983;
}

</style>

<template>
<div class="hello">
  <img alt="Vue logo" src="../../Resources/public/images/logo.png">
  <h3>{{ msg }}</h3>
</div>

</template>

<script>

export default {
    name: 'Home',
    props: {
        msg: String
    }
}

</script>
