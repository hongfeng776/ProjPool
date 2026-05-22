@echo off
echo ========================================
echo  安装项目依赖
echo ========================================
echo.

echo [1/2] 安装前端依赖...
cd client
call npm install
cd ..

echo.
echo [2/2] 安装后端依赖...
cd server
call npm install
cd ..

echo.
echo ========================================
echo  依赖安装完成！
echo ========================================
pause
