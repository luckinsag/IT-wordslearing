import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/Home.vue')
      },
      {
        path: 'wordlist',
        name: 'WordList',
        component: () => import('../views/WordList.vue')
      },
      {
        path: 'study',
        name: 'Study',
        component: () => import('../views/Study.vue')
      },
      {
        path: 'test',
        name: 'Test',
        component: () => import('../views/Test.vue')
      },
      {
        path: 'important',
        name: 'Important',
        component: () => import('../views/Important.vue')
      },
      {
        path: 'mistakes',
        name: 'Mistakes',
        component: () => import('../views/Mistakes.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue')
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('../views/Login.vue')
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('../views/Register.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 