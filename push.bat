@echo off
echo ====================================================
echo   Pushing Mini ERP + CRM Project to GitHub
echo ====================================================
echo.
set "PATH=C:\Program Files\Git\cmd;%PATH%"

echo Remote: https://github.com/rajputmonu1436-svg/erp-crm-portal.git
echo Branch: main
echo.
echo Executing git push...
git push -u origin main

echo.
echo ====================================================
echo   DONE! Check your repository on GitHub.
echo ====================================================
pause
