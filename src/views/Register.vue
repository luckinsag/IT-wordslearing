<template>
  <div class="register-container">
    <v-card class="register-card" elevation="2">
      <v-card-title class="text-center text-h4 mb-4">
        新規登録
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleRegister">
          <v-text-field
            v-model="username"
            label="ユーザーネーム"
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
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model="confirmPassword"
            label="パスワード（確認）"
            prepend-inner-icon="mdi-lock-check"
            :type="showConfirmPassword ? 'text' : 'password'"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
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
            登録
          </v-btn>
          <div class="text-center">
            <router-link to="/login" class="text-decoration-none">
              すでにアカウントをお持ちの方はこちら
            </router-link>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data: () => ({
    username: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false
  }),
  methods: {
    handleRegister() {
      // TODO: 実装登録ロジック
      console.log('Register attempt:', this.username, this.password)
    }
  }
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background-color: #f5f5f5;
  padding-top: 8vh;
}

.register-card {
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