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

echo.
echo ========================================
echo   LiteEditor Installer Build
echo ========================================
echo.

echo [1/3] Building desktop bundles...
call bun run build:desktop
if errorlevel 1 (
  echo Desktop build failed.
  exit /b %errorlevel%
)

echo.
echo [2/3] Packaging Windows portable build...
call node scripts/build-desktop-artifact.ts --platform win --target dir --arch x64 --keep-stage --verbose
if errorlevel 1 (
  echo Packaging failed.
  exit /b %errorlevel%
)

echo.
echo [3/3] Copying to release directory...

:: Find the staging dir (most recent t3code-desktop-win-stage-*)
set "STAGE_DIR="
for /d %%D in ("%TEMP%\t3code-desktop-win-stage-*") do set "STAGE_DIR=%%D"

if not defined STAGE_DIR (
  echo Could not find staging directory in %%TEMP%%.
  exit /b 1
)

if not exist "%STAGE_DIR%\app\dist\win-unpacked\liteeditor.exe" (
  echo liteeditor.exe not found in staging directory.
  exit /b 1
)

if not exist "release\win-unpacked" mkdir "release\win-unpacked"
xcopy /s /e /y /q "%STAGE_DIR%\app\dist\win-unpacked\*" "release\win-unpacked\" >nul
if errorlevel 1 (
  echo Failed to copy to release directory.
  exit /b %errorlevel%
)

echo.
echo ========================================
echo   Build complete!
echo ========================================
echo.
echo   Output: release\win-unpacked\liteeditor.exe
echo.
for %%F in ("release\win-unpacked\liteeditor.exe") do echo   Size: %%~zF bytes
echo.
