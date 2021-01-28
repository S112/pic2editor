<template>
  <section class="container">
    <Demo />
  </section>
</template>

<script>
import Demo from 'components/demo.vue'
export default {
  naem: 'App',
  components: {
    Demo
  }
}
</script>

<style lang="stylus" scoped>
.container
  box-sizing border-box
  width 100%
  height 100vh
</style>
