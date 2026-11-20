@echo off
setlocal
cd /d "%~dp0"
title AulaPlay - Servidor local

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERROR] No se encuentra Node.js.
  echo Instala Node.js LTS desde https://nodejs.org/ y vuelve a ejecutar starter.bat.
  echo.
  pause
  exit /b 1
)

set "AULAPLAY_URL=http://localhost:4173"
echo.
echo ======================================
echo          AULAPLAY - INICIANDO
echo ======================================
echo.
echo Abriendo %AULAPLAY_URL%
echo Deja esta ventana abierta mientras uses la web.
echo Pulsa Ctrl+C para detener el servidor.
echo.

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%AULAPLAY_URL%"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "%AULAPLAY_URL%"
) else if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
  start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "%AULAPLAY_URL%"
) else (
  start "" "%AULAPLAY_URL%"
)
node server.js
if errorlevel 1 (
  echo.
  echo El servidor se ha detenido por un error.
  pause
)
endlocal
