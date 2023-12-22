// // The Vue build version to load with the `import` command
// // (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// import Vue from 'vue'
// import App from './App'
// import router from './router'

// Vue.config.productionTip = false

// /* eslint-disable no-new */
// new Vue({
//   el: '#app',
//   router,
//   components: { App },
//   template: '<App/>'
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
