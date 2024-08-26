//import './assets/main.css'


// Import our custom CSS
import './scss/styles.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'


import { createApp } from 'vue'
import App from './App.vue'
import PresetList from './components/PresetList.vue'



const app = createApp(App)
app.component('PresetList', PresetList)
app.mount('#app')


