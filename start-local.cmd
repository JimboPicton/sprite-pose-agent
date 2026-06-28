@echo off
title Sprite Pose Agent Local Server
cd /d "%~dp0"

set "NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE%" (
  where node >nul 2>nul
  if errorlevel 1 (
    echo Node.js was not found.
    echo Install Node.js 20 or newer, then run this file again.
    pause
    exit /b 1
  )
  set "NODE=node"
)

echo Starting Sprite Pose Agent v0.5.3...
echo Keep this window open and visit http://127.0.0.1:4173
echo.
"%NODE%" server.mjs
echo.
echo The server stopped. The message above should explain why.
pause
