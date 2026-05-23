@echo off
chcp 65001 >nul
title 个人运动步数分析可视化工具

echo ============================================================
echo      个人运动步数分析可视化工具 - 一键运行
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/2] 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo   ✗ 未找到Python，请先安装Python 3.8+
    pause
    exit /b 1
)
echo   ✓ Python环境正常
echo.

echo [2/2] 运行分析程序...
echo.
python main.py

echo.
echo ============================================================
echo      程序执行完毕，按任意键退出...
echo ============================================================
pause >nul
