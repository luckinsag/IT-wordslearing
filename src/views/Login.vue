<template>
  <div class="login-container">
    <v-card class="login-card" elevation="2">
      <v-card-title class="text-center text-h4 mb-4">
        welcome
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleLogin">
          <v-text-field
            v-model="username"
            label="ユーザー名"
            prepend-inner-icon="mdi-account"
            variant="outlined"
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="パスワード"
            prepend-inner-icon="mdi-lock"
            :type="showPassword ? 'text' : 'password'"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            variant="outlined"
            class="mb-6"
          ></v-text-field>
          <v-btn
            color="primary"
            block
            type="submit"
            :loading="loading"
            class="mb-4"
          >
            ログイン
          </v-btn>
          <div class="text-center">
            <router-link to="/register" class="text-decoration-none">
              アカウントをお持ちでない方はこちら
            </router-link>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data: () => ({
    username: '',
    password: '',
    showPassword: false
  }),
  methods: {
    handleLogin() {
      // TODO: 実装ログインロジック
      console.log('Login attempt:', this.username, this.password)
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background-color: #f5f5f5;
  padding-top: 8vh;
}

.login-card {
  width: 480px;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
}

:deep(.v-card-title) {
  font-size: 2rem !important;
  font-weight: 500 !important;
  color: #1a1a1a;
}

:deep(.v-text-field) {
  margin-bottom: 1.5rem;
}

:deep(.v-btn) {
  height: 48px !important;
  font-size: 1.1rem !important;
  text-transform: none !important;
}

:deep(.v-btn--block) {
  margin-bottom: 1.5rem;
}

:deep(a) {
  color: #1976d2;
  font-size: 0.95rem;
}
</style> 