import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'
import auth from './utils/auth'
import staffAuth from './utils/staffAuth'

auth.initAuth()
staffAuth.initStaffAuth()

const app = createApp(App)
app.use(router)
app.mount('#app')
