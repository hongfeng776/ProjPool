<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <h1 class="logo">📚 阅读时间胶囊</h1>
        <nav class="nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/books" class="nav-link">书架</router-link>
          <router-link to="/capsules" class="nav-link">时间胶囊</router-link>
        </nav>
      </div>
    </header>
    <main class="main">
      <router-view />
    </main>
    <footer class="footer">
      <p>© 2024 阅读时间胶囊 - 记录阅读，珍藏时光</p>
    </footer>
  </div>
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  color: #667eea;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #667eea;
}

.main {
  flex: 1;
  padding: 2rem 0;
}

.footer {
  background: rgba(255, 255, 255, 0.9);
  text-align: center;
  padding: 1rem;
  color: #666;
}
</style>
