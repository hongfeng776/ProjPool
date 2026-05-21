<template>
  <div class="page-container">
    <h2>关于系统</h2>
    <div class="about-card">
      <h3>便利通会员积分管理系统</h3>
      <p>版本 1.0.0</p>
      <p class="tech-stack">
        技术栈：Vue 前端框架 | Node.js + Express | MongoDB | Redis | Nginx
      </p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page-container {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-container h2 {
  margin: 0 0 20px;
  color: #333;
}

.about-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.about-card h3 {
  margin: 0 0 12px;
  color: #667eea;
}

.about-card p {
  margin: 6px 0;
  color: #666;
}

.tech-stack {
  font-size: 0.9rem;
  color: #999 !important;
}
</style>
