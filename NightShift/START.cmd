@echo off
cd /d "%~dp0"
set "GAME_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%GAME_NODE%" (
  "%GAME_NODE%" server.cjs
) else (
  node server.cjs
)
pause
