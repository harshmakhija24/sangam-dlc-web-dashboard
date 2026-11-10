@echo off
cd /d "%~dp0"
echo Syncing Google Sheet to Sangam Resources Data and HTML...
node scratch\sync_resources.js
echo.
echo Done!
pause

