import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api', // 使用相对路径，让 Vite 代理处理
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 添加请求拦截器
api.interceptors.request.use(
  config => {
    console.log('Request:', config)
    return config
  },
  error => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 添加响应拦截器
api.interceptors.response.use(
  response => {
    console.log('Response:', response)
    return response
  },
  error => {
    console.error('Response Error:', error)
    return Promise.reject(error)
  }
)

export default {
  // 获取所有单词
  getAllWords() {
    return api.post('/words/all')
  },

  // 获取按课程分类的单词
  getWordsByCategories(startLesson, endLesson) {
    // 生成课程列表，格式为 "Lesson X"
    const categories = []
    for (let i = parseInt(startLesson); i <= parseInt(endLesson); i++) {
      categories.push(`Lesson ${i}`)
    }
    
    console.log('Sending categories:', categories)
    // 发送 JSON 数组
    return api.post('/words/byCategories', JSON.stringify(categories))
  }
} 