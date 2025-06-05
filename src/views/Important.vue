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
              label=""
              density="compact"
              hide-details
              style="width: 150px;"
              class="mr-4"
            ></v-select>
            <span class="mr-4">～</span>
            <v-select
              v-model="lessonRange.end"
              :items="lessonOptions"
              label=""
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
            to="/wordlist"
          >
            単語リストへ
          </v-btn>

          <v-btn
            color="secondary"
            variant="text"
            class="mr-4"
            to="/mistakes"
          >
            バツ単語へ
          </v-btn>

          <v-btn
            color="error"
            variant="text"
            class="mr-4"
            :disabled="!selectedWords.length"
            @click="confirmDelete"
          >
            削除
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
        重要単語が見つかりません
      </v-card-text>
      <v-data-table
        v-else
        :headers="headers"
        :items="words"
        :items-per-page="itemsPerPage"
        class="elevation-1"
        show-select
        v-model="selectedWords"
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
              color="warning"
              @click="toggleImportant(item)"
              class="mr-2"
            ></v-btn>
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
            icon="mdi-close" 
            variant="text" 
            @click="noteDialog = false"
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

    <!-- 删除确认对话框 -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">
          確認
          <v-spacer></v-spacer>
          <v-btn 
            icon="mdi-close" 
            variant="text" 
            @click="deleteDialog = false"
          ></v-btn>
        </v-card-title>
        <v-card-text>
          選択した単語を重要単語から削除しますか？
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            @click="deleteSelectedWords"
          >
            削除
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="deleteDialog = false"
          >
            キャンセル
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
  name: 'Important',
  data: () => ({
    lessonRange: {
      start: '1',
      end: '31'
    },
    itemsPerPage: 10,
    noteDialog: false,
    deleteDialog: false,
    currentNote: '',
    currentItem: null,
    selectedWords: [],
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
        title: '　　　 日本語',
        key: 'japanese',
        sortable: true,
        width: '30%'
      },
      {
        title: '中国語',
        key: 'chinese',
        sortable: true,
        width: '20%'
      },
      {
        title: '英語',
        key: 'english',
        sortable: true,
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
    // 获取重要单词列表
    async fetchWords() {
      this.loading = true
      this.error = null
      try {
        const response = await wordService.getImportantWords(
          this.lessonRange.start,
          this.lessonRange.end
        )
        if (response && response.data) {
          this.words = response.data
        } else {
          this.words = []
        }
      } catch (error) {
        this.error = error.response?.data?.message || '重要単語の取得に失敗しました'
        this.words = []
      } finally {
        this.loading = false
      }
    },

    // 播放日语发音
    async playAudio(word) {
      try {
        const utterance = new SpeechSynthesisUtterance(word.japanese)
        utterance.lang = 'ja-JP'
        utterance.rate = 1.0
        utterance.pitch = 1.0
        
        await new Promise((resolve, reject) => {
          utterance.onend = resolve
          utterance.onerror = reject
          window.speechSynthesis.speak(utterance)
        })
      } catch (error) {
        this.showSnackbar('语音播放失败，请检查浏览器设置', 'error')
      }
    },

    // 切换重要标记
    async toggleImportant(item) {
      try {
        item.isImportant = !item.isImportant
        // TODO: 同步到数据库
        if (!item.isImportant) {
          this.words = this.words.filter(w => w !== item)
        }
        this.showSnackbar(
          item.isImportant ? '重要単語に追加しました' : '重要単語から削除しました',
          'success'
        )
      } catch (error) {
        this.showSnackbar('操作に失敗しました', 'error')
      }
    },

    // 打开笔记对话框
    openNoteDialog(item) {
      this.currentItem = item
      this.currentNote = item.note || ''
      this.noteDialog = true
    },

    // 保存笔记
    async saveNote() {
      if (this.currentItem) {
        try {
          this.currentItem.note = this.currentNote
          // TODO: 同步到数据库
          this.showSnackbar('ノートを保存しました', 'success')
        } catch (error) {
          this.showSnackbar('ノートの保存に失敗しました', 'error')
        }
      }
      this.noteDialog = false
    },

    // 显示所有课程
    showAllLessons() {
      this.lessonRange = {
        start: '1',
        end: '31'
      }
    },

    // 确认删除
    confirmDelete() {
      if (this.selectedWords.length > 0) {
        this.deleteDialog = true
      }
    },

    // 删除选中的单词
    async deleteSelectedWords() {
      try {
        // TODO: 同步到数据库
        this.words = this.words.filter(word => !this.selectedWords.includes(word))
        this.selectedWords = []
        this.showSnackbar('選択した単語を削除しました', 'success')
      } catch (error) {
        this.showSnackbar('削除に失敗しました', 'error')
      }
      this.deleteDialog = false
    },

    // 显示提示信息
    showSnackbar(text, color = 'info') {
      this.snackbar = {
        show: true,
        text,
        color
      }
    }
  }
}
</script>

<style scoped>
.v-data-table {
  background: white;
}

.v-btn.mr-2 {
  margin-right: 8px;
}
</style> 