<template>
  <v-app>
    <!-- Left Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      app
      :rail="rail"
      permanent
      color="white"
      @mouseenter="rail = false"
      @mouseleave="rail = true"
    >
      <!-- User Profile Section -->
      <div class="user-profile pa-4">
        <div class="d-flex flex-column align-center">
          <v-avatar
            :size="rail ? 40 : 64"
            color="primary"
            class="mb-2"
          >
            <v-icon :size="rail ? 20 : 32" color="white">mdi-account</v-icon>
          </v-avatar>
          <span v-if="!rail" class="text-subtitle-1">ユーザー名</span>
        </div>
      </div>

      <v-divider></v-divider>

      <v-list class="mt-4">
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path"
          link
          class="nav-item"
          :exact="item.path === '/'"
        >
          <div class="d-flex align-center">
            <v-icon class="mr-6">{{ item.icon }}</v-icon>
            <span v-if="!rail">{{ item.title }}</span>
          </div>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- 顶部导航栏 -->
    <v-app-bar
      app
      color="white"
      elevation="1"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>IT Words Learning</v-toolbar-title>
      
      <!-- 搜索栏 -->
      <!-- 在考试页面和设置页面不显示搜索栏 -->
      <v-text-field
        v-if="!isTestPage && !isSettingsPage"
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="検索する単語を入力..."
        single-line
        hide-details
        density="compact"
        style="max-width: 500px;"
      ></v-text-field>
      
      <v-spacer></v-spacer>
      
      <!-- Login and Register Buttons -->
      <div class="d-flex align-center mr-8">
        <v-btn
          color="primary"
          variant="text"
          class="mr-2"
          to="/login"
        >
          ログイン
        </v-btn>
        <v-btn
          color="primary"
          variant="outlined"
          to="/register"
        >
          新規登録
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-4">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'Layout',
  data: () => ({
    drawer: true,
    rail: true,
    search: '',
    menuItems: [
      {
        title: 'ホームページ',
        icon: 'mdi-home',
        path: '/'
      },
      {
        title: '単語リスト',
        icon: 'mdi-list-box',
        path: '/wordlist'
      },
      {
        title: '単語学習',
        icon: 'mdi-book-open-page-variant',
        path: '/study'
      },
      {
        title: 'テスト',
        icon: 'mdi-pencil',
        path: '/test'
      },
      {
        title: '重要単語',
        icon: 'mdi-star',
        path: '/important'
      },
      {
        title: 'バツ単語',
        icon: 'mdi-close-circle',
        path: '/mistakes'
      },
      {
        title: 'セット',
        icon: 'mdi-cog',
        path: '/settings'
      }
    ]
  }),
  computed: {
    isTestPage() {
      return this.$route.path === '/test'
    },
    isSettingsPage() {
      return this.$route.path === '/settings'
    }
  },
  watch: {
    search(newValue) {
      // TODO: 实现搜索功能
      console.log('Search:', newValue)
    }
  }
}
</script>

<style scoped>
/* 容器背景颜色 */
.v-main {
  background-color: rgb(239, 239, 239);
}

.nav-item {
  padding: 0 16px;
  margin-bottom: 5px;
}

.nav-item .v-icon {
  font-size: 24px;
}

.nav-item span {
  font-size: 14px;
  white-space: nowrap;
}

.user-profile {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 当抽屉收起时调整头像区域高度 */
.v-navigation-drawer--rail .user-profile {
  min-height: 80px;
}
</style> 