@echo off
setlocal

cd /d "%~dp0"

where bun >nul 2>nul
if errorlevel 1 (
  echo Bun was not found in PATH.
  echo Install Bun, then rerun this script.
  exit /b 1
)

if not exist "node_modules" (
  echo node_modules is missing.
  echo Run "bun install" from this repo root, then rerun this script.
  exit /b 1
)

echo Building desktop bundles...
call bun run build:desktop
if errorlevel 1 (
  echo Desktop build failed.
  exit /b %errorlevel%
)

echo Launching desktop app...
call bun run start:desktop
exit /b %errorlevel%
