@echo off
echo ========================================
echo  门店会员管理系统 - 一键启动脚本
echo ========================================
echo.

echo [1/3] 启动后端服务...
start "后端服务" cmd /k "cd /d %~dp0server && npm install && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/3] 启动前端服务...
start "前端服务" cmd /k "cd /d %~dp0client && npm install && npm run dev"

echo.
echo ========================================
echo  服务启动中，请稍候...
echo  前端地址: http://localhost:5173
echo  后端地址: http://localhost:3000
echo  通过 Nginx 访问: http://localhost
echo ========================================
echo.
pause
