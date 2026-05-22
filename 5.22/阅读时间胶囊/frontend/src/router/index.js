import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Books from '../views/Books.vue'
import Capsules from '../views/Capsules.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/books',
    name: 'Books',
    component: Books
  },
  {
    path: '/capsules',
    name: 'Capsules',
    component: Capsules
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
