@echo off
set /p GHUSER=Enter your GitHub username: 
cd /d "%~dp0.."
git remote remove origin 2>nul
git remote add origin https://github.com/%GHUSER%/Deadlink.git
git branch -M main
echo.
echo Pushing to GitHub - log in if prompted...
git push -u origin main
echo.
echo Done. Next: render.com - delete ALL old deadlink services - New + - Blueprint - Deadlink repo
pause