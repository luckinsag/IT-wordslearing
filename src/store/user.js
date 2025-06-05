import { ref } from 'vue'

// 创建响应式的用户状态
const username = ref('')

// 从 localStorage 中恢复用户状态
const initUserState = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      username.value = user.username
    } catch (e) {
      console.error('Failed to parse user data:', e)
    }
  }
}

// 设置用户状态
const setUser = (user) => {
  username.value = user.username
  localStorage.setItem('user', JSON.stringify(user))
}

// 清除用户状态
const clearUser = () => {
  username.value = ''
  localStorage.removeItem('user')
}

// 初始化用户状态
initUserState()

export default {
  username,
  setUser,
  clearUser
} 