// src/stores/gameStore.ts
import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', {
  state: () => ({
    currentImageIndex: 0, // Initial state for currentImageIndex
    guess: 0, // Initial state for guess
    points: 0, // Initial state for points
    // Add other state properties as needed
  }),
  actions: {
    setCurrentImageIndex(index: number) {
      this.currentImageIndex = index;
    },
    setGuess(guess: number) {
      this.guess = guess;
    },
    setPoints(points: number) {
      this.points = points;
    },
    // Implement other actions as necessary
  },
});
