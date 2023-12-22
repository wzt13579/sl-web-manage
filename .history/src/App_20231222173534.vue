<template>
    <router-view/>
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

