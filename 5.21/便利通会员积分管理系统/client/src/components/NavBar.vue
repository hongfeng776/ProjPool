<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="nav-logo">
        <span class="logo-icon">🏪</span>
        <span>便利通</span>
      </router-link>
      <ul class="nav-menu">
        <li>
          <router-link to="/" class="nav-link">首页</router-link>
        </li>
        <li>
          <router-link to="/exchange" class="nav-link">积分兑换</router-link>
        </li>
        <li>
          <router-link to="/members" class="nav-link">会员管理</router-link>
        </li>
        <li v-if="!auth.state.member">
          <router-link to="/register" class="nav-link">会员注册</router-link>
        </li>
        <li v-if="!auth.state.member">
          <router-link to="/login" class="nav-link">会员登录</router-link>
        </li>
        <li v-else>
          <router-link to="/profile" class="nav-link">会员中心</router-link>
        </li>
        <li>
          <router-link to="/points" class="nav-link">积分管理</router-link>
        </li>
        <li v-if="!staffAuth.isStaffLoggedIn()">
          <router-link to="/staff-login" class="nav-link staff-link">员工登录</router-link>
        </li>
        <li v-else>
          <router-link to="/staff-panel" class="nav-link">员工面板</router-link>
        </li>
        <li>
          <router-link to="/about" class="nav-link">关于</router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import auth from '@/utils/auth'
import staffAuth from '@/utils/staffAuth'
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  height: 60px;
}

.nav-logo {
  display: flex;
  align-items: center;
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 600;
  margin-right: 40px;
}

.logo-icon {
  font-size: 1.8rem;
  margin-right: 8px;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}

.nav-menu li {
  margin-right: 8px;
}

.nav-link {
  display: block;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.2s ease;
  font-size: 0.9rem;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.staff-link {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 10px;
  }
  
  .nav-logo {
    margin: 0 0 10px 0;
  }
  
  .nav-menu {
    justify-content: center;
  }
}
</style>
