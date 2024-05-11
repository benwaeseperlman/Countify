<script setup lang='ts'>
  import Button from 'primevue/button';
  import ProgressBar from 'primevue/progressbar';
  
  import { PagePaths } from '@/utils/pagePaths';

  import { ref, onMounted } from 'vue';
  import { useGameStore } from '@/store/gameStore';
  import data from '@/data/countify-pictures.json';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const store = useGameStore();

  // Define reactive properties at the top level
  const currentImageIndex = ref(store.currentImageIndex);
  const currentImageURL = ref('');
  const currentSearchTarget = ref('');
  const searchCountOptions = ref<number[]>([]);

  onMounted(() => {
    if (currentImageIndex.value < 0 || currentImageIndex.value >= data.allPictures.length) {
      store.setCurrentImageIndex(0);
      router.push(PagePaths.PLAY);
    } else {
      setupComponentState();
    }
  });

  function setupComponentState() {
    // Update the reactive properties based on the currentImageIndex
    currentImageURL.value = data.allPictures[currentImageIndex.value].imageURL;
    currentSearchTarget.value = data.allPictures[currentImageIndex.value].searchTarget;
    searchCountOptions.value = data.allPictures[currentImageIndex.value].searchCountOptions; // Use spread to clone array
  }

  // The rest of your component logic...
  // Some constant values
  const PROGRESS_BAR_SPEED_GETREADY = 0.4;  // normally 0.5
  const PROGRESS_BAR_SPEED_SHOWIMAGE = 0.1; // normally 0.1
  const PROGRESS_BAR_SPEED_HOWMANY = 0.4;   // normally 0.5
  const IMAGE_BLUR_SPEED = 1.025;           // normally 1.025
  const IMAGE_BLUR_MAX = 50;                // normally 50
  const IMAGE_REVEAL_SPEED = 0.998;         // normally 0.998
  const IMAGE_REVEAL_END_VALUE = 0.1;       // normally 0.1
  const MAX_POINTS = 200;                   // normally 20
  const POINTS_DECREASE_SPEED = 0.2;        // normally 0.2

  // Game state
  const gameState = ref(0);
  const progressBar = ref(100);
  const imageBlur = ref(0);

  // Functions to control the game
  function startGame() {
    gameState.value = 1;
    progressBar.value = 100;
    // Countdown the timer to start the game
    const interval = setInterval(() => {
      progressBar.value -= PROGRESS_BAR_SPEED_GETREADY;
      if (progressBar.value <= 0) {
        clearInterval(interval);
        showImage();
      }
    }, 10);
  }

  function showImage() {
    gameState.value = 2;
    progressBar.value = 0;

    const interval = setInterval(() => {
      progressBar.value += PROGRESS_BAR_SPEED_SHOWIMAGE; // Adjust the speed of the progress bar here

      if (progressBar.value >= 100) {
        clearInterval(interval);
        blurImage();
      }
    }, 10);
  }

  function blurImage() {
    // Fade out the image
    imageBlur.value = 0.01;
    gameState.value = 3;
    const interval = setInterval(() => {
      imageBlur.value += IMAGE_BLUR_SPEED; // Adjust the speed of the blur here

      if (imageBlur.value >= IMAGE_BLUR_MAX) {
        clearInterval(interval);
        showHowManyMessage();
      }
    }, 10);
  }

  function showHowManyMessage() {
    // Show the "How many of the following did you see?" message
    gameState.value = 4;
    progressBar.value = 100;
    const interval = setInterval(() => {
      progressBar.value -= PROGRESS_BAR_SPEED_HOWMANY;
      if (progressBar.value <= 0) {
        clearInterval(interval);
        showHowManyWhats();
      }
    }, 10);
  }



  function randomizeLabels() {
    searchCountOptions.value = searchCountOptions.value.sort(() => Math.random() - 0.5);
  }
  randomizeLabels();

  const points = ref(200);
  function showHowManyWhats() {
    // Show the string of what they're looking for, and populate the guess input matrix and submit button
    gameState.value = 5;

    // Slowly reveal the image
    imageBlur.value = IMAGE_BLUR_MAX;
    const interval = setInterval(() => {
      imageBlur.value *= IMAGE_REVEAL_SPEED;

      if (imageBlur.value <= IMAGE_REVEAL_END_VALUE) {  // Adjust end value here
        clearInterval(interval);
        showTimesUpMessage();
      }

      // Update the number of points it's worth
      points.value = MAX_POINTS - Math.floor(MAX_POINTS * (1 - Math.pow(imageBlur.value / IMAGE_BLUR_MAX, POINTS_DECREASE_SPEED)));
      if (points.value > 10) {
        points.value = Math.round(points.value / 10) * 10;
      }
      else {
        points.value = Math.round(points.value);
      }
    }, 10)
  }

  function showTimesUpMessage() {
    // Show the "Times up!" message
    gameState.value = 6;
  }

  function handleGuess(guess: number) {
    store.setGuess(guess);
    store.setPoints(points.value);
    router.push(PagePaths.GAME_RESULTS);
}
</script>

<template>
  <div class="pt-2 pl-4 pr-4">
    <div v-if="currentSearchTarget !== ''" class="container">
      <!-- Image display -->
      <section class="image-display">

        <!-- Image -->
        <img :src=currentImageURL alt="Random image"
          :style="{ filter: `blur(${imageBlur}px)`, opacity: `${gameState === 2 ? '1' : '0'}` }" />

        <div class="image-display-overlay">

          <!-- Waiting to start -->
          <Button v-if="gameState === 0" label="Click to start" @click="startGame" />

          <!-- Get ready -->
          <div class="how-many-message" v-if="gameState === 1">
            How many {{ currentSearchTarget }}?
          </div>

          <!-- How many message -->
          <div v-if="gameState === 4" class="how-many-message">
            <p>How many {{ currentSearchTarget }} did you see?</p>
          </div>

          <!-- How many whats -->
          <div v-if="gameState === 5" class="how-many-message">
            <div class="how-many-whats">
              <h1>{{ points }} points</h1>
              <p class="points">{{ currentSearchTarget }}</p>
            </div>
          </div>

          <!-- Times up message -->
          <div v-if="gameState === 6" class="how-many-whats">
            <h1>Times up!</h1>
            <p class="points">Pick one to continue</p>
          </div>
        </div>

        <!-- Progress bars -->
        <ProgressBar v-if="gameState === 1 || gameState === 4" :value="progressBar" id="progress-bar-message"
          class="progress-bar">.</ProgressBar>
        <ProgressBar v-if="gameState === 2" :value="progressBar" class="progress-bar" id="progress-bar-image"
          :class="{ 'first-third': progressBar > 25 && progressBar <= 55, 'second-third': progressBar > 55 && progressBar <= 80, 'almost-done': progressBar > 80 }">
          .</ProgressBar>

      </section>



      <!-- Estimate input -->
      <div class="w-full mt-12">
        <div class="grid grid-cols-3 gap-4">
          <Button v-for="(label, index) in searchCountOptions" :key="index" class="square-button"
            :disabled="gameState <= 4" @click="handleGuess(label)">
            <span v-if="gameState > 2 && gameState <= 4" style="font-size: 1.5rem; color:var(--text-color-secondary);"
              class="pi pi-spin pi-spinner"></span>
            {{ gameState >= 5 ? label : '' }}
          </Button>

        </div>
      </div>
    </div>
    <div v-if="!currentSearchTarget">
      <div class="uh-oh pt-10">
        <p>We ran out of pictures...</p>
        <h3>You have {{ store.points  }} points</h3>
      </div>
    </div>
    <router-link class="quit-button" :to="PagePaths.PLAY">
      <Button label="Quit" text severity="secondary" size="small" />
    </router-link>

  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  max-width: 720px;
  margin: 0 auto;
  /* Add this line to center the container horizontally */
}

/* Image display - this is the frame that holds the image */
.image-display {
  background-color: var(--surface-a);
  border-radius: var(--border-radius);
  border: 1px solid var(--surface-border);
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  overflow: hidden;
  max-width: 720px;
}

.image-display img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}

.image-display-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Progress bar */
.image-display .progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
}

#progress-bar-message:deep(.p-progressbar-value) {
  background: var(--surface-a);
}

#progress-bar-image:deep(.p-progressbar-value) {
  background: var(--blue-900);
}

.first-third:deep(.p-progressbar-value) {
  background: var(--blue-700) !important;
}

.second-third:deep(.p-progressbar-value) {
  background: var(--blue-500) !important;
}

.almost-done:deep(.p-progressbar-value) {
  background: var(--yellow-300) !important;
}

:deep(.p-progressbar-value) {
  transition: width 0s, background-color 2s;
}

/* How many message */
.how-many-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.how-many-whats {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.how-many-whats .points {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-color-secondary);
}

.square-button {
  width: 100%;
  height: 100px;
  background-color: var(--surface-a);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: 500;
  color: var(--text-primary);
}

.uh-oh {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}


/* Quit button */
.quit-button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 3rem;
  align-items: center;
}
</style>