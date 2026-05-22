<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="login-title">
        <h2>门店会员综合管理系统</h2>
        <p>Store Member Management System</p>
      </div>
      <el-form :model="loginForm" label-width="80px" class="login-form">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loginForm = ref({
  username: '',
  password: ''
})

const handleLogin = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;

  .login-card {
    width: 400px;
    padding: 20px;

    .login-title {
      text-align: center;
      margin-bottom: 30px;

      h2 {
        color: #303133;
        margin-bottom: 10px;
      }

      p {
        color: #909399;
        font-size: 14px;
      }
    }

    .login-form {
      padding: 0 20px;
    }
  }
}
</style>
