<script setup lang='ts'>
  import Button from 'primevue/button'
  import { PagePaths } from '@/utils/pagePaths'

  import { ref, onMounted } from 'vue';
  import { useGameStore } from '@/store/gameStore'; // Import the store
  import data from '@/data/countify-pictures.json';
  import { useRouter } from 'vue-router'; // Import useRouter

  // Game state
  const gameState = ref(0);

  const hidePins = ref(false);

  // Use the store
  const store = useGameStore();

  // Access store values
  const currentImageIndex = store.currentImageIndex;
  const userGuess = store.guess;
  const userPotentialPoints = store.points;
  const actualPoints = userGuess === data.allPictures[currentImageIndex].searchTargetLocations.length ? userPotentialPoints : 0;

  const crowdAverage = ref(Math.round(data.allPictures[currentImageIndex].crowdAverage));

  const currentImageURL = ref(data.allPictures[currentImageIndex].imageURL);
  const currentSearchTarget = ref(data.allPictures[currentImageIndex].searchTarget);

  // Router instance for programmatic navigation
  const router = useRouter();

  // Delayed rendering of pins
  const displaySearchTargetLocations = ref<{ x: number; y: number; }[]>([]);
  const DELAY = 250;
  const GAME_STATE_DELAY = 500;


  onMounted(() => {
    gameState.value = 0;
    setTimeout(() => {
      showCrowdAverage();
    }, GAME_STATE_DELAY);
  });

  function showCrowdAverage() {
    gameState.value = 1;
    setTimeout(() => {
      showPins();
    }, GAME_STATE_DELAY);
  }


  function showPins() {
    gameState.value = 2;
    const locations = data.allPictures[currentImageIndex].searchTargetLocations;
    locations.forEach((location, index) => {
      setTimeout(() => {
        displaySearchTargetLocations.value.push(location);
        if (index === locations.length - 1) {
          setTimeout(() => {
            showActualNumber();
          }, GAME_STATE_DELAY);
        }
      }, index * DELAY);
    });
  }

  function showActualNumber() {
    gameState.value = 3;
    setTimeout(() => {
      showScore();
    }, GAME_STATE_DELAY * 4);
  }

  function showScore() {
    gameState.value = 4;
    setTimeout(() => {
      showNextChallenge();
    }, GAME_STATE_DELAY);
  }

  function showNextChallenge() {
    gameState.value = 5;
  }

  function handleHidePins() {
    hidePins.value = !hidePins.value;
  }

  function handleNextChallenge() {
    store.setCurrentImageIndex(currentImageIndex + 1);
    router.push(PagePaths.GAME_ON); // Navigate to the new page
}
</script>

<template>
  <div class="pt-2 pl-4 pr-4">
    <div class="grid gap-10 center">
      <!-- Image display -->
      <section class="image-display">
        <img :src="currentImageURL" alt="Countify Image" />
        <!-- Display the pins -->
        <div v-if="gameState >= 2 && !hidePins" class="search-target-locations">
          <span v-for="(location, index) in displaySearchTargetLocations" :key="index" class="pin"
            :style="{ top: location.y + '%', left: location.x + '%' }">
            <span class="pin-label">{{ index + 1 }}</span>
          </span>
        </div>
        <!-- Hide the pins button -->
        <Button v-if="gameState >= 2" :icon="hidePins ? 'pi pi-eye-slash' : 'pi pi-eye'" rounded text severity="info"
          style="position:absolute; bottom: 8px; right: 8px;" @click="handleHidePins" />
    </section>


    <div class="search-target-label">{{ currentSearchTarget }}</div>

    <div class="row-of-three">
      <!-- User guess -->
      <div class="number-section w-full">
        <p>Your guess</p>
        <span class="big-number">{{ userGuess }}</span>
      </div>
      <!-- Average guess -->
      <div class="number-section w-full">
        <p>Crowd average</p>
        <span v-if="gameState >= 1" class="big-number">{{
          crowdAverage }}</span>
        <span v-else class="big-number"><i class="loading-spinner pi pi-spin pi-spinner"></i></span>
      </div>
      <!-- Result -->
      <div class="number-section w-full">
        <p>Actual number</p>
        <span v-if="gameState >= 3" class="big-number">{{
          data.allPictures[currentImageIndex].searchTargetLocations.length }}</span>
        <span v-else class="big-number"><i class="loading-spinner pi pi-spin pi-spinner"></i></span>
      </div>
    </div>

    <!-- Score -->
    <div class="flex flex-row justify-center">
      <div class="number-section score" :class="gameState >= 4 && actualPoints > 0 ? 'winner' : 'loser'">
        <p>Your score</p>
        <span v-if="gameState >= 4" class="big-number">{{ actualPoints }}</span>
        <span v-else class="big-number"><i class="loading-spinner pi pi-spin pi-spinner"></i></span>
      </div>
    </div>
  </div>

  <!-- Bottom buttons -->
  <div class="bottom-buttons">
    <router-link :to=PagePaths.GAME_ON>
      <Button v-if="gameState >= 5" label="Next challenge" style="width: 12rem" @click="handleNextChallenge" />
    </router-link>
    <router-link class="quit-button" :to=PagePaths.HOME>
      <Button label="Quit" text severity="secondary" size="small" />
    </router-link>
  </div>
  </div>
</template>

<style scoped>
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

.search-target-locations {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0px;
}

.pin {
  position: absolute;
  display: inline-block;
  border-radius: 50% 50% 50% 0;
  border: 3px solid #fff;
  width: 30px;
  height: 30px;
  transform: rotate(-45deg);
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.5);
  /* Adds shadow to the block */
  backdrop-filter: blur(5px);
  transform-origin: -100% 50%;
}

.pin-label {
  color: #FFF;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: rotate(45deg);
  font-size: 1rem;
  height: 23.5px;
  width: 23.5px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  /* Adds shadow to text */
}

.search-target-label {
  font-size: 1.5rem;
  font-weight: 500;
  text-align: center;
  margin-top: 0rem;
}

.row-of-three {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.number-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 12rem;
  padding: 1.5rem;
  border-radius: 50%;
}

.number-section.score {
  background-color: var(--surface-a);
  border: 2px solid transparent;

}

.number-section.winner {
  border-color: var(--primary-color);
}

.number-section.loser {
  background-color: var(--surface-a);
}

.big-number {
  height: 3rem;
  font-size: 3rem;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  font-weight: 500;
  font-size: 1.5rem;
  color: var(--primary-color);
}

.bottom-buttons {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 4rem;
  gap: 1rem;

}

.center {
  justify-content: center;
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