<script setup lang='ts'>
  import { ref } from 'vue';
  import FileUpload from 'primevue/fileupload';
  import Chip from 'primevue/chip';

  const gameState = ref(0);

  const uploadedImageURL = ref('');
  const whatAreWeCounting = ref('');

  const displaySearchTargetLocations = ref<{ x: number; y: number; id: Date }[]>([]);


  function onUploader(event: any) {
    // this is temporary, until we have a proper upload
    // console.log('before upload image:', event.files[0]);
    gameState.value = 1;
    uploadedImageURL.value = 'assets/pictures/empty_boats.jpg'
  }

  function beginCountifying() {
    gameState.value = 2
  }

  function restartCountifying() {
    gameState.value = 1
  }

  function handleImageClick(event: MouseEvent) {
    console.log('Image clicked');
    if (gameState.value === 2) {
      const uploadedImage = event.target as HTMLImageElement;
      const rect = uploadedImage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      displaySearchTargetLocations.value.push({ x, y, id: Date.now() });
    }
  }

  function removeChip(locationId: number) {
    const index = displaySearchTargetLocations.value.findIndex(location => location.id === locationId);
    if (index !== -1) {
      displaySearchTargetLocations.value.splice(index, 1);
    }
  }

  function areYouSure() {
    gameState.value = 3
  }

  function saveThis() {
    // Save the data
    downloadLocationsAsJson(); // this downloads it locally... temporary!
  }


  function downloadLocationsAsJson() {

    const newImage = {
      imageURL: uploadedImageURL.value,
      uploadDate: new Date().toISOString(),
      searchTarget: whatAreWeCounting.value,
      searchTargetCount: displaySearchTargetLocations.value.length,
      searchCountOptions: generateUniqueNumbersAroundInput(displaySearchTargetLocations.value.length),
      searchTargetLocations: displaySearchTargetLocations.value.map(location => ({
        x: location.x,
        y: location.y
      })),
      crowdAverage: fakeCrowdAverage(displaySearchTargetLocations.value.length),
    };

    const newImageJson = JSON.stringify(newImage);

    // Create a Blob with the JSON content
    const blob = new Blob([newImageJson], { type: "application/json" });

    // Create a link element
    const link = document.createElement("a");

    // Set the link's href to point to the Blob
    link.href = URL.createObjectURL(blob);

    // Suggest a default file name for the download
    link.download = `${newImage.searchTarget}.json`;

    // Trigger the download by programmatically clicking the link
    document.body.appendChild(link); // Append the link to the document
    link.click(); // Programmatically click the link to trigger the download

    // Clean up by removing the temporary link
    document.body.removeChild(link);
  }


  function generateUniqueNumbersAroundInput(input: number) {
    // Determine the range of the random offset. This might need adjustment based on input.
    const maxOffset = 10;

    // Initialize a set to hold the generated numbers, including the input to ensure uniqueness
    let numbers = new Set([input]);

    // Function to check if the number is valid (not negative and greater than 2)
    function isValidNumber(number: number) {
      return number >= 3;
    }

    // Keep generating numbers until the set has 12 unique, valid values
    while (numbers.size < 12) {
      // Generate a random offset. The offset can be both negative and positive, adjusted for input
      let offset = Math.floor(Math.random() * maxOffset + 1) * (Math.random() > 0.5 ? 1 : -1);
      let candidate = input + offset;

      // Ensure the candidate is valid; if not, skip the addition
      if (isValidNumber(candidate)) {
        numbers.add(candidate);
      }
    }

    // Convert the set back to an array for shuffling
    numbers = [...numbers];

    // Shuffle the array to randomize the position of the input number
    // for (let i = numbers.length - 1; i > 0; i--) {
    //   const j = Math.floor(Math.random() * (i + 1));
    //   [numbers[i], numbers[j]] = [numbers[j], numbers[i]]; // Swap elements
    // }

    // Sort the array from low to high
    numbers.sort((a, b) => a - b);

    return numbers;
  }



  function fakeCrowdAverage(number: number) {
    return number + number * (Math.random() * 0.6 - 0.3);
  }
</script>

<template>
  <div class="pt-2 pl-4 pr-4">
    <div class="container grid gap-10 center">

      <!-- Upload button & disclaimer -->
      <div v-if="gameState === 0" class="file-upload">
        <FileUpload mode="basic" name="demo[]" url="assets/pictures" :multiple="false" :auto="true" :customUpload="true"
          @uploader="onUploader" accept="image/*" chooseLabel="Select an image" />
      </div>
      <div v-if="gameState === 0" class="permission-statement">
        <p>By uploading content to <span class="countify-name">Countify.me</span>, you confirm that you own or have
          the rights to use and authorize <span class="countify-name">Countify.me</span>
          and its users to use the content as per this agreement. You grant <span
            class="countify-name">Countify.me</span> a worldwide, non-exclusive,
          royalty-free license to use, distribute, modify, display, and perform the content in relation to its
          service.</p>
        <p>You are solely responsible for the content you upload, ensuring its legality and that it does not infringe
          on any third-party rights. You agree to indemnify <span class="countify-name">Countify.me</span> against any
          legal
          claims related to the content you upload.
        </p>
        <p>Countify.me may remove any content if it believes it violates this agreement, its terms of service, or any
          laws.
        </p>
        <p>By uploading content, you acknowledge and agree to these terms.</p>
      </div>

      <!-- Image display -->
      <section v-if="gameState >= 1" class="image-display">
        <img id="uploadedImage" :src="uploadedImageURL" alt="Uploaded image" @click="handleImageClick" />

        <!-- Display the pins -->
        <div v-if="gameState >= 1" class="search-target-locations">
          <span v-for="(location, index) in displaySearchTargetLocations" :key="index" class="pin"
            :style="{ top: location.y + '%', left: location.x + '%' }">
            <span class="pin-label">{{ index + 1 }}</span>
          </span>
        </div>


 

      </section>
 
      <!-- Get the name of what we're counting -->
      <div v-if="gameState === 1" class="get-details">
        <p>What are we counting?</p>
        <InputText v-focus class="w-full" style="text-align:center; font-size: 1.75rem;" placeholder=""
          v-model="whatAreWeCounting" @keyup.enter="beginCountifying" />
        <Button :disabled="!whatAreWeCounting" label="Next" style="width: 12rem; margin-top: 20px;"
          @click="beginCountifying" />
      </div>

      <!-- Count the things -->
      <div v-if="gameState === 2" class="get-details">

        <div class="chips-container">
          <Chip class="chip" v-for="location, index in displaySearchTargetLocations" :key="location.id" removable
            @remove="() => removeChip(location.id)">
            <span>{{ index + 1 }}</span> <!-- Or display index + 1, but it's not the key anymore -->
            <!-- <span>x: {{ location.x.toFixed(2) }}, y: {{ location.y.toFixed(2) }}</span> -->
          </Chip>
        </div>

        <p v-if="displaySearchTargetLocations.length === 0">Click each of the {{ whatAreWeCounting }} to make sure we
          get an accurate count.</p>
        <div class="flex row gap-2 mt-10">
          <Button severity="secondary" outlined label="Back" style="width: 12rem" @click="restartCountifying" />
          <Button label="Done" style="width: 12rem;" @click="areYouSure" />
        </div>
      </div>

      <!-- Are you sure -->
      <div v-if="gameState === 3" class="get-details">
        <p>Are you sure you sure there are {{ displaySearchTargetLocations.length }} {{ whatAreWeCounting }}?</p>
        <div class="flex row gap-2 mt-10">
          <Button severity="secondary" outlined label="No, go back" style="width: 12rem" @click="beginCountifying" />
          <Button label="Yes, I'm sure" style="width: 12rem;" @click="saveThis" />
        </div>

      </div>
    </div>
    <router-link class="quit-button" to="/countify-play">
      <Button label="Cancel" text severity="secondary" size="small" class="w-10rem" />
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
}

.file-upload {
  background-color: var(--surface-a);
  border-radius: var(--border-radius);
  border: 1px solid var(--surface-border);
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 250px;
  width: 100%;
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
  min-height: 250px;
  max-width: 720px;
}

.image-display img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}

.permission-statement p {
  font-size: .75rem;
  color: var(--text-color-secondary);
}

.get-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}


.search-target-locations {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0px;
  pointer-events: none;
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

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.chip {
  font-size: 1rem;
  gap: 8px;
  ;
}

.chip span:nth-child(2) {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
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