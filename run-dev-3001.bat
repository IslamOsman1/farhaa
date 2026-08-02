@echo off
setlocal

subst X: /d >nul 2>&1
subst X: "%~dp0"

pushd X:\
echo Starting FARHA dev server on http://127.0.0.1:3001
call npm run dev -- --port 3001
popd

