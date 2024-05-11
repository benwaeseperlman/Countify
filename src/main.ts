import 'primevue/resources/themes/lara-dark-blue/theme.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import PrimeVue from 'primevue/config';

import App from '@/App.vue'


const pinia = createPinia()

createApp(App)
  .use(pinia)
  .use(router)
  .use(PrimeVue)
  .mount('#app')
