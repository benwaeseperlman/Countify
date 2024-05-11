<script setup lang='ts'>
  import Button from 'primevue/button'
  import { PagePaths } from '@/utils/pagePaths'
</script>

<template>
  <div class="container pt-20 pl-10 pr-10 text-center">
    <h2>Welcome to Countify!</h2>
    <div class="grid flex-column gap-10">
        <p>It's been said that groups can produce more accurate estimates than most individuals. When you average all the guesses, the final number is often spot on.</p>
        <p>Countify.me puts the wisdom of crowds to the test.</p>
        <p>Choose between a solo game, start a group challenge or join an existing one.</p>

        <div class="row">
          <router-link :to="PagePaths.GAME_ON" class="w-full">
            <Button 
              label="Play solo"
              class="w-full"
            />
          </router-link>
        </div>
        <div class="row w-full flex gap-3">
          <Button 
            label="Start a group challenge"
            class="w-full"
            disabled
          />
            <Button 
              label="Join a group challenge"
              class="w-full"
              disabled
            />
        </div>
    </div>
  </div>
  <AppFooter />
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 720px;
  margin: 0 auto;
}
</style>