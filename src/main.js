//import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import PresetList from './components/PresetList.vue'



const app = createApp(App)
app.component('PresetList', PresetList)
app.mount('#app')
