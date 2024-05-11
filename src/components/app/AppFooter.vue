<script setup lang='ts'>
// const version = ref(import.meta.env.VITE_APP_VERSION)
</script>

<template>
  <div class="mt-4 layout-footer">
    <router-link class="footer-button" to="/countify-Play">Play</router-link>
    <router-link class="footer-button" to="/countify-upload-challenge">Add a challenge</router-link>
    <router-link class="footer-button" to="/countify-user-profile">Profile</router-link>
  </div>
</template>

<style scoped>
.footer-button {
  padding: 10px 20px;
  color: #fff !important;
  text-decoration: none;
  width: 100%;
  white-space: nowrap;
}
</style>
