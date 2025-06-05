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
            to="/study"
          >
            単語学習へ
          </v-btn>

          <v-btn
            color="secondary"
            variant="text"
            class="mr-4"
            to="/test"
          >
            テストへ
          </v-btn>

          <v-btn
            color="secondary"
            variant="text"
            class="mr-4"
            to="/important"
          >
            重要単語へ
          </v-btn>

          <v-btn
            color="secondary"
            variant="text"
            class="mr-4"
            to="/mistakes"
          >
            バツ単語へ
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 单词列表 -->
    <v-card>
      <v-card-text v-if="loading">
        読み込み中...
      </v-card-text>
      <v-card-text v-else-if="error">
        {{ error }}
      </v-card-text>
      <v-card-text v-else-if="!words.length">
        単語が見つかりません
      </v-card-text>
      <v-data-table
        v-else
        :headers="headers"
        :items="words"
        :items-per-page="itemsPerPage"
        class="elevation-1"
      >
        <!-- 日语列 -->
        <template v-slot:item.japanese="{ item }">
          <div class="d-flex align-center" style="padding-left: 45px;">
            <span class="text-h6">{{ item.japanese }}</span>
            <v-btn
              icon="mdi-volume-high"
              variant="text"
              size="small"
              class="ml-2"
              @click="playAudio(item)"
            ></v-btn>
          </div>
        </template>

        <!-- 英语列 -->
        <template v-slot:item.english="{ item }">
          <span>{{ item.english }}</span>
        </template>

        <!-- 笔记列 -->
        <template v-slot:item.note="{ item }">
          <span>{{ item.note || '-' }}</span>
        </template>

        <!-- 中文列 -->
        <template v-slot:item.chinese="{ item }">
          <span>{{ item.chinese }}</span>
        </template>

        <!-- 操作列 -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center" style="margin-left: -15px;">
            <v-btn
              icon="mdi-star"
              variant="text"
              size="small"
              :color="item.isImportant ? 'warning' : ''"
              @click="toggleImportant(item)"
              class="mr-2"
            ></v-btn>
            <!-- 有笔记的时候空心笔团变成实心笔，warningse -->
            <v-btn
              
              icon="mdi-lead-pencil"
              variant="text"
              size="small"
              :color="item.note ? 'warning' : ''"
              @click="openNoteDialog(item)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- 笔记对话框 -->
    <v-dialog v-model="noteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">
          ノート
          <v-spacer></v-spacer>
          <v-btn 
            icon="mdi-cat" 
            variant="text" 
            @click="noteDialog = false"
            size="large"
            class="cat-icon"
          ></v-btn>
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="currentNote"
            label="ノートを書く"
            rows="4"
            auto-grow
            hide-details
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="saveNote"
          >
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 提示信息 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import wordService from '@/api/wordService'

export default {
  name: 'WordList',
  data: () => ({
    lessonRange: {
      start: '1',
      end: '31'
    },
    itemsPerPage: 10,
    noteDialog: false,
    currentNote: '',
    currentItem: null,
    snackbar: {
      show: false,
      text: '',
      color: 'info'
    },
    lessonOptions: Array.from({ length: 31 }, (_, i) => ({
      title: `Lesson ${i + 1}`,
      value: String(i + 1)
    })),
    headers: [
      {
        title: '　　　日本語',
        key: 'japanese',
        sortable: true,
        width: '30%'
      },
      {
        title: '中国語',
        key: 'chinese',
        sortable: true,
        width: '15%'
      },
      {
        title: '英語',
        key: 'english',
        sortable: true,
        width: '15%'
      },
      {
        title: 'ノート',
        key: 'note',
        sortable: false,
        width: '20%'
      },
      {
        title: '操作',
        key: 'actions',
        sortable: false,
        width: '10%',
        align: 'start'
      }
    ],
    words: [],
    loading: false,
    error: null
  }),
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
        if (response && response.data) {
          this.words = response.data
          console.log('Updated words:', this.words)
        } else {
          console.error('Invalid response format:', response)
          this.words = []
        }
      } catch (error) {
        this.error = error.response?.data?.message || '単語リストの取得に失敗しました'
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
    async playAudio(word) {
      console.log('Playing audio for:', word.japanese)
      
      try {
        // 使用 Web Speech API
        const utterance = new SpeechSynthesisUtterance(word.japanese)
        utterance.lang = 'ja-JP'
        utterance.rate = 1.0 // 正常语速
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

    // 切换重要标记
    toggleImportant(item) {
      item.isImportant = !item.isImportant
      // TODO: 同步到数据库
      console.log('Toggle important for:', item)
    },

    // 打开笔记对话框
    openNoteDialog(item) {
      this.currentItem = item
      this.currentNote = item.note || ''
      this.noteDialog = true
    },

    // 保存笔记
    saveNote() {
      if (this.currentItem) {
        this.currentItem.note = this.currentNote
        // 更新按钮图标
        this.currentItem.noteIcon = this.currentNote ? 'mdi-pencil' : 'mdi-pencil-outline'
        // TODO: 同步到数据库
        console.log('Save note for:', this.currentItem)
      }
      this.noteDialog = false
    },

    // 显示所有课程
    showAllLessons() {
      this.lessonRange = {
        start: '1',
        end: '31'
      }
    }
  }
}
</script>

<style scoped>
.v-data-table {
  background: white;
}

/* 笔记按钮样式 */
.v-btn.mr-2 {
  margin-right: 8px;
}

/* 猫图标样式 */
.cat-icon {
  transform: scale(1.5);
}

.cat-icon :deep(.v-icon) {
  font-size: 32px !important;
}
</style> 