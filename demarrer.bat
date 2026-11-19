@echo off
title OPEN THE GATE - Application de Test de Niveau d'Anglais
set "PATH=C:\Users\Hakimou MOUHAMADOU\nodejs\node-v20.18.0-win-x64;%PATH%"

echo ====================================================
echo     OPEN THE GATE - Test de Niveau CECRL
echo ====================================================
echo Demarrage du serveur en cours...
echo.

start "" "http://localhost:5000"
node server/src/index.js
pause
