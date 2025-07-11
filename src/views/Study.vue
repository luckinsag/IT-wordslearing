<template>
  <div class="study-container">
    <!-- 顶部操作栏 -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center">
          <div class="d-flex align-center mr-4">
            <!-- <span class="mr-2">从</span> -->
            <v-select
              v-model="lessonRange.start"
              :items="lessonOptions"
              label="选择课程"
              density="compact"
              hide-details
              style="width: 150px;"
              class="mr-2"
            ></v-select>
            <span class="mr-2">〜</span>
            <v-select
              v-model="lessonRange.end"
              :items="lessonOptions"
              label="选择课程"
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
            color="primary"
            variant="text"
            class="mr-4"
            @click="shuffleWords"
          >
            ランダム
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <v-card v-if="loading" class="word-card" elevation="2">
      <v-card-text class="text-center">
        <v-progress-circular indeterminate></v-progress-circular>
        <div class="mt-4">加载中...</div>
      </v-card-text>
    </v-card>

    <!-- Error State -->
    <v-card v-else-if="error" class="word-card" elevation="2">
      <v-card-text class="text-center text-error">
        {{ error }}
      </v-card-text>
    </v-card>

    <!-- Empty State -->
    <v-card v-else-if="!words.length" class="word-card" elevation="2">
      <v-card-text class="text-center">
        没有找到单词
      </v-card-text>
    </v-card>

    <!-- Word Display Card -->
    <v-card v-else class="word-card" elevation="2">
      <!-- Left Navigation Button -->
      <v-btn
        icon="mdi-chevron-left"
        size="large"
        @click="previousWord"
        :disabled="currentIndex === 0"
        class="nav-btn nav-btn-left"
      ></v-btn>

      <!-- Word Content -->
      <v-card-text class="text-center">
        <!-- Japanese Word -->
        <div class="japanese-word" v-show="showJapanese">
          <h1 class="text-h2 mb-8">{{ currentWord.japanese }}</h1>
          <v-btn
            icon="mdi-volume-high"
            variant="text"
            size="large"
            @click="playAudio"
            class="mb-4"
          ></v-btn>
        </div>
        
        <!-- English and Chinese Translation -->
        <div class="translations">
          <h2 class="text-h4 mb-4">{{ currentWord.english }}</h2>
          <h3 class="text-h5 text-grey">{{ currentWord.chinese }}</h3>
        </div>

        <!-- Progress -->
        <div class="progress mt-8">
          {{ currentIndex + 1 }} / {{ words.length }}
        </div>

        <!-- Star Icon -->
        <v-btn
          icon="mdi-star"
          variant="text"
          size="large"
          :color="currentWord.isImportant ? 'warning' : 'grey'"
          @click="toggleImportant"
          class="star-btn"
        ></v-btn>
      </v-card-text>

      <!-- Right Navigation Button -->
      <v-btn
        icon="mdi-chevron-right"
        size="large"
        @click="nextWord"
        :disabled="currentIndex === words.length - 1"
        class="nav-btn nav-btn-right"
      ></v-btn>
    </v-card>

    <!-- Toggle Button -->
    <div class="text-center mt-6">
      <v-btn
        color="primary"
        class="mx-2"
        @click="toggleJapanese"
      >
        {{ showJapanese ? '日本語を隠す' : '日本語を見る' }}
      </v-btn>
      <v-btn
        color="secondary"
        prepend-icon="mdi-list-box"
        to="/wordlist"
        class="mx-2"
      >
        単語リストへ
      </v-btn>
      <v-btn
        color="secondary"
        prepend-icon="mdi-lead-pencil"
        to="/test"
        class="mx-2"
      >
        テストへ
      </v-btn>
      <v-btn
        color="secondary"
        prepend-icon="mdi-star"
        to="/important"
        class="mx-2"
      >
        重要単語へ
      </v-btn>
      <v-btn
        color="secondary"
        prepend-icon="mdi-close-circle"
        to="/mistakes"
        class="mx-2"
      >
        バツ単語へ
      </v-btn>
    </div>
  </div>
</template>

<script>
import wordService from '@/api/wordService'

export default {
  name: 'Study',
  data: () => ({
    lessonRange: {
      start: '1',
      end: '31'
    },
    lessonOptions: Array.from({ length: 31 }, (_, i) => ({
      title: `Lesson ${i + 1}`,
      value: String(i + 1)
    })),
    showJapanese: true,
    currentIndex: 0,
    words: [],
    loading: false,
    error: null
  }),
  computed: {
    currentWord() {
      return this.words[this.currentIndex] || {}
    }
  },
  watch: {
    lessonRange: {
      handler(newRange) {
        this.fetchWords()
      },
      deep: true
    }
  },
  created() {
    this.fetchWords()
  },
  methods: {
    // 获取单词列表
    async fetchWords() {
      this.loading = true
      this.error = null
      try {
        console.log('Fetching words with range:', this.lessonRange)
        let response
        // 如果选择了全部课程，使用 getAllWords
        if (this.lessonRange.start === '1' && this.lessonRange.end === '31') {
          response = await wordService.getAllWords()
        } else {
          // 否则使用 getWordsByCategories
          response = await wordService.getWordsByCategories(
            this.lessonRange.start,
            this.lessonRange.end
          )
        }
        console.log('Received response:', response)
        if (response && response.data && response.data.data) {
          this.words = response.data.data
          this.currentIndex = 0
          console.log('Updated words:', this.words)
        } else {
          console.error('Invalid response format:', response)
          this.words = []
        }
      } catch (error) {
        this.error = error.response?.data?.message || '获取单词列表失败'
        console.error('Error fetching words:', error)
        if (error.response) {
          console.error('Error response:', error.response)
        }
        this.words = []
      } finally {
        this.loading = false
      }
    },

    // 播放日语发音
    async playAudio() {
      console.log('Playing audio for:', this.currentWord.japanese)
      
      try {
        // 使用 Web Speech API
        const utterance = new SpeechSynthesisUtterance(this.currentWord.japanese)
        utterance.lang = 'ja-JP'
        utterance.rate = 1.0
        utterance.pitch = 1.0
        
        // 等待语音播放完成
        await new Promise((resolve, reject) => {
          utterance.onend = resolve
          utterance.onerror = reject
          window.speechSynthesis.speak(utterance)
        })
        
        console.log('Speech synthesis completed')
      } catch (error) {
        console.error('Speech synthesis failed:', error)
        this.$nextTick(() => {
          this.$vuetify.snackbar = {
            show: true,
            text: '语音播放失败，请检查浏览器设置',
            color: 'error'
          }
        })
      }
    },

    // 显示所有课程
    showAllLessons() {
      this.lessonRange = {
        start: '1',
        end: '31'
      }
    },

    // 打乱单词顺序
    shuffleWords() {
      const array = [...this.words]
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
      }
      this.words = array
      this.currentIndex = 0
    },

    toggleJapanese() {
      this.showJapanese = !this.showJapanese
    },

    nextWord() {
      if (this.currentIndex < this.words.length - 1) {
        this.currentIndex++
      }
    },

    previousWord() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },

    toggleImportant() {
      if (this.currentWord) {
        this.currentWord.isImportant = !this.currentWord.isImportant
        // TODO: 同步到数据库
        console.log('Toggle important for:', this.currentWord)
      }
    }
  }
}
</script>

<style scoped>
.study-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.word-card {
  padding: 40px;
  border-radius: 12px;
  height: 400px;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.japanese-word {
  margin-bottom: 40px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.translations {
  margin-top: 40px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.nav-btn-left {
  left: 20px;
}

.nav-btn-right {
  right: 20px;
}

.progress {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.1rem;
  color: rgba(0, 0, 0, 0.6);
}

.mx-2 {
  margin: 0 8px;
}

.mt-6 {
  margin-top: 48px;
}

.star-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1;
}
</style> 