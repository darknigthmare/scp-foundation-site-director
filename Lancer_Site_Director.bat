@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 18 ou plus recent est requis.
  echo https://nodejs.org/
  pause
  exit /b 1
)
if not exist "dist\game.js" (
  echo Construction du jeu...
  call npm run build
  if errorlevel 1 pause & exit /b 1
)
start "SCP Site Director Server" /min cmd /c "node scripts\serve.mjs --dist"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:4173"
echo SCP Foundation: Site Director est lance sur http://127.0.0.1:4173
echo Fermez la fenetre serveur pour arreter le jeu.
endlocal
