// import Vue from 'vue'
// import Router from 'vue-router'
// import HelloWorld from '@/components/HelloWorld'

// Vue.use(Router)

// export default new Router({
//   routes: [
//     {
//       path: '/',
//       name: 'HelloWorld',
//       component: HelloWorld
//     }
//   ]
// })
<template>
  <router-view :class="[mode]" />
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  computed: {
    mode() {
      return this.$store.getters['settings/mode'];
    }
  }
});
</script>
