<template>
  <div class="settings-container">
    <v-card class="mb-4">
      <v-card-title class="text-h5 mb-4">設定</v-card-title>
      
      <!-- 头像选择 -->
      <v-card-text>
        <div class="mb-6">
          <div class="text-subtitle-1 mb-2">アバター</div>
          <div class="avatar-grid">
            <v-avatar
              v-for="(avatar, index) in avatars"
              :key="index"
              :color="selectedAvatar === index ? 'primary' : 'grey'"
              size="64"
              class="ma-2"
              @click="selectAvatar(index)"
            >
              <v-img :src="avatar" cover></v-img>
            </v-avatar>
          </div>
        </div>

        <!-- 考试历史 -->
        <div class="mb-6">
          <div class="text-subtitle-1 mb-2">テスト履歴</div>
          <v-list>
            <v-list-item
              v-for="(history, index) in testHistory"
              :key="index"
              :title="`テスト ${history.date}`"
              :subtitle="`正解率: ${history.correctRate}%`"
            >
              <template v-slot:append>
                <v-btn
                  icon="mdi-eye"
                  variant="text"
                  @click="viewTestDetail(history)"
                ></v-btn>
              </template>
            </v-list-item>
          </v-list>
        </div>

        <!-- 退出按钮 -->
        <div class="text-center">
          <v-btn
            color="error"
            variant="outlined"
            prepend-icon="mdi-logout"
            @click="logout"
          >
            ログアウト
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 考试详情对话框 -->
    <v-dialog v-model="showTestDetail" max-width="600px">
      <v-card>
        <v-card-title class="text-h5">
          テスト詳細
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showTestDetail = false"
          ></v-btn>
        </v-card-title>
        <v-card-text>
          <div v-if="selectedTest">
            <div class="mb-4">
              <div class="text-subtitle-1">日付: {{ selectedTest.date }}</div>
              <div class="text-subtitle-1">正解率: {{ selectedTest.correctRate }}%</div>
            </div>
            <v-list>
              <v-list-item
                v-for="(question, index) in selectedTest.questions"
                :key="index"
                :title="question.chinese"
                :subtitle="question.japanese"
              >
                <template v-slot:append>
                  <v-icon
                    :color="question.isCorrect ? 'success' : 'error'"
                    size="small"
                  >
                    {{ question.isCorrect ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data: () => ({
    avatars: [
      '/avatars/avatar1.png',
      '/avatars/avatar2.png',
      '/avatars/avatar3.png',
      '/avatars/avatar4.png',
      '/avatars/avatar5.png',
      '/avatars/avatar6.png',
      '/avatars/avatar7.png',
      '/avatars/avatar8.png',
      '/avatars/avatar9.png',
      '/avatars/avatar10.png'
    ],
    selectedAvatar: 0,
    testHistory: [
      {
        date: '2024-03-20',
        correctRate: 80,
        questions: [
          { chinese: '吃', japanese: '食べる', isCorrect: true },
          { chinese: '喝', japanese: '飲む', isCorrect: false }
        ]
      },
      {
        date: '2024-03-19',
        correctRate: 90,
        questions: [
          { chinese: '学习', japanese: '勉強する', isCorrect: true },
          { chinese: '工作', japanese: '働く', isCorrect: true }
        ]
      }
    ],
    showTestDetail: false,
    selectedTest: null
  }),
  methods: {
    selectAvatar(index) {
      this.selectedAvatar = index
      // 保存到本地存储
      localStorage.setItem('avatar', this.avatars[index])
      // 触发全局事件更新导航栏头像
      this.$root.$emit('update-avatar', this.avatars[index])
    },
    viewTestDetail(test) {
      this.selectedTest = test
      this.showTestDetail = true
    },
    logout() {
      // 清除本地存储
      localStorage.clear()
      // 跳转到登录页
      this.$router.push('/login')
    }
  },
  created() {
    // 从本地存储加载头像设置
    const savedAvatar = localStorage.getItem('avatar')
    if (savedAvatar) {
      this.selectedAvatar = this.avatars.indexOf(savedAvatar)
    }
  }
}
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  justify-items: center;
}

.v-avatar {
  cursor: pointer;
  transition: transform 0.2s;
}

.v-avatar:hover {
  transform: scale(1.1);
}

.v-avatar.selected {
  border: 2px solid var(--v-primary-base);
}
</style> 