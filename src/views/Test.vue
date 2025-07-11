<template>
  <div>
    <!-- 顶部操作栏 -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <div class="d-flex align-center mr-4">
            <v-select
              v-model="lessonRange.start"
              :items="lessonOptions"
              label="レッスンを選択"
              density="compact"
              hide-details
              style="width: 150px;"
              class="mr-4"
            ></v-select>
            <span class="mr-4">～</span>
            <v-select
              v-model="lessonRange.end"
              :items="lessonOptions"
              label="レッスンを選択"
              density="compact"
              hide-details
              style="width: 150px;"
            ></v-select>
          </div>
          
          <v-btn
            color="primary"
            variant="text"
            class="mr-4"
            @click="showAllLessons"
          >
            全部
          </v-btn>

          <v-btn
            color="secondary"
            variant="text"
            class="mr-4"
            @click="startTest"
            :disabled="!canStartTest"
          >
            テスト開始
          </v-btn>
          <!-- prepend-icon="mdi-exit-to-app" -->
          <v-btn
            color="secondary"
            variant="text"
            class="mr-4"
            @click="exitTest"
          >
            テストを終了
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 考试区域 -->
    <v-card v-if="isTestStarted">
      <v-card-text>
        <!-- 进度显示 -->
        <div class="d-flex justify-space-between align-center mb-4">
          <div class="text-h6">
            問題 {{ currentQuestionIndex + 1 }}/10
          </div>
          <div class="text-h6">
            正解: {{ correctCount }}
          </div>
        </div>

        <!-- 题目显示 -->
        <div v-if="currentQuestion" class="text-center mb-6">
          <div class="text-h5 mb-4">{{ currentQuestion.chinese }}</div>
          <v-text-field
            v-model="userAnswer"
            label="日本語を入力"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mx-auto"
            style="max-width: 400px;"
            @keyup.enter="checkAnswer"
          ></v-text-field>
        </div>

        <!-- 答案反馈 -->
        <div v-if="showFeedback" class="text-center">
          <div :class="isCorrect ? 'text-success' : 'text-error'" class="text-h6 mb-2">
            {{ isCorrect ? '正解！' : '不正解' }}
          </div>
          <div v-if="!isCorrect && showCorrectAnswer" class="text-body-1 mb-4">
            正解: {{ currentQuestion.japanese }}
          </div>
          <v-btn
            v-if="!isCorrect"
            color="primary"
            @click="showCorrectAnswer = true"
            class="mr-2"
          >
            答えを見る
          </v-btn>
          <v-btn
            v-if="!isCorrect || showCorrectAnswer"
            color="primary"
            @click="nextQuestion"
          >
            {{ isLastQuestion ? '結果を見る' : '次の問題' }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 结果页面 -->
    <v-card v-if="showResults">
      <v-card-text>
        <div class="text-center">
          <div class="text-h4 mb-4">テスト結果</div>
          <div class="text-h5 mb-6">
            正解率: {{ (correctCount / 10 * 100).toFixed(1) }}%
          </div>
          
          <!-- 答题记录 -->
          <div class="test-results mb-6">
            <!-- 表头 -->
            <div class="result-header mb-2">
              <div class="d-flex align-center justify-center">
                <span class="question-number mr-2">No.</span>
                <span class="chinese-text mr-4">中国語</span>
                <span class="japanese-text mr-4">正解</span>
                <span class="user-answer-text mr-4">あなたの答え</span>
                <span class="result-icon">結果</span>
              </div>
            </div>
            <!-- 答题记录列表 -->
            <div v-for="(word, index) in testWords" :key="index" class="result-item mb-2">
              <div class="d-flex align-center justify-center">
                <span class="question-number mr-2">{{ index + 1 }}.</span>
                <span class="chinese-text mr-4">{{ word.chinese }}</span>
                <span class="japanese-text mr-4">{{ word.japanese }}</span>
                <span class="user-answer-text mr-4" :class="{'text-error': userAnswers[index] !== word.japanese.replace(/[（(].*?[)）]/g, '').trim()}">
                  {{ userAnswers[index] || '未回答' }}
                </span>
                <v-icon
                  :color="userAnswers[index] === word.japanese.replace(/[（(].*?[)）]/g, '').trim() ? 'success' : 'error'"
                  size="small"
                >
                  {{ userAnswers[index] === word.japanese.replace(/[（(].*?[)）]/g, '').trim() ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
              </div>
            </div>
          </div>

          <v-btn
            color="primary"
            @click="resetTest"
          >
            もう一度
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import wordService from '@/api/wordService'

export default {
  name: 'Test',
  data: () => ({
    lessonRange: {
      start: '1',
      end: '31'
    },
    lessonOptions: Array.from({ length: 31 }, (_, i) => ({
      title: `Lesson ${i + 1}`,
      value: String(i + 1)
    })),
    words: [],
    testWords: [],
    currentQuestionIndex: 0,
    userAnswer: '',
    userAnswers: [], // 存储用户的所有答案
    showFeedback: false,
    showCorrectAnswer: false,
    isCorrect: false,
    correctCount: 0,
    isTestStarted: false,
    showResults: false
  }),
  computed: {
    currentQuestion() {
      return this.testWords[this.currentQuestionIndex]
    },
    isLastQuestion() {
      return this.currentQuestionIndex === 9
    },
    canStartTest() {
      return this.words.length >= 10
    }
  },
  watch: {
    lessonRange: {
      handler() {
        this.fetchWords()
      },
      deep: true
    }
  },
  created() {
    this.fetchWords()
  },
  methods: {
    async fetchWords() {
      try {
        let response
        if (this.lessonRange.start === '1' && this.lessonRange.end === '31') {
          response = await wordService.getAllWords()
        } else {
          response = await wordService.getWordsByCategories(
            this.lessonRange.start,
            this.lessonRange.end
          )
        }
        if (response && response.data) {
          this.words = response.data
        }
      } catch (error) {
        console.error('Error fetching words:', error)
      }
    },
    showAllLessons() {
      this.lessonRange = {
        start: '1',
        end: '31'
      }
    },
    startTest() {
      // 随机选择10个单词
      this.testWords = this.getRandomWords(10)
      this.currentQuestionIndex = 0
      this.correctCount = 0
      this.userAnswers = [] // 重置用户答案
      this.isTestStarted = true
      this.showResults = false
      this.userAnswer = ''
      this.showFeedback = false
    },
    getRandomWords(count) {
      const shuffled = [...this.words].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, count)
    },
    checkAnswer() {
      if (!this.userAnswer.trim()) return
      
      // 移除括号内的读音和所有空格后再比较
      const cleanAnswer = this.userAnswer.trim()
        .replace(/[（(].*?[)）]/g, '') // 移除括号内容
        .replace(/\s+/g, '') // 移除所有空格
        .trim()
      
      const cleanCorrect = this.currentQuestion.japanese
        .replace(/[（(].*?[)）]/g, '') // 移除括号内容
        .replace(/\s+/g, '') // 移除所有空格
        .trim()
      
      this.isCorrect = cleanAnswer === cleanCorrect
      // 保存用户答案
      this.userAnswers[this.currentQuestionIndex] = this.userAnswer.trim()
      
      if (this.isCorrect) {
        this.correctCount++
        // 答案正确时，显示反馈后自动进入下一题
        this.showFeedback = true
        setTimeout(() => {
          this.nextQuestion()
        }, 1000) // 1秒后自动进入下一题
      } else {
        this.showFeedback = true
        this.showCorrectAnswer = false
      }
    },
    nextQuestion() {
      if (this.isLastQuestion) {
        this.showResults = true
        this.isTestStarted = false
      } else {
        this.currentQuestionIndex++
        this.userAnswer = ''
        this.showFeedback = false
        this.showCorrectAnswer = false
      }
    },
    resetTest() {
      this.isTestStarted = false
      this.showResults = false
      this.currentQuestionIndex = 0
      this.correctCount = 0
      this.userAnswers = [] // 重置用户答案
      this.userAnswer = ''
      this.showFeedback = false
      this.showCorrectAnswer = false
    },
    exitTest() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.v-card {
  margin-bottom: 20px;
}

.test-results {
  max-width: 800px;
  margin: 0 auto;
}

.result-header {
  padding: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  font-weight: bold;
}

.result-item {
  padding: 8px;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.question-number {
  min-width: 40px;
  font-weight: bold;
}

.chinese-text {
  min-width: 120px;
}

.japanese-text {
  min-width: 180px;
}

.user-answer-text {
  min-width: 180px;
}

.result-icon {
  min-width: 40px;
  text-align: center;
}

.text-error {
  color: #ff5252;
}

/* 添加新的样式 */
.v-card-text {
  padding: 24px;
}

.d-flex {
  padding: 0 16px;
}
</style> 