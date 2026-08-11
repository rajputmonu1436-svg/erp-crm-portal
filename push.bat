@echo off
echo ====================================================
echo   Uploading Full Mini ERP + CRM Project to GitHub
echo ====================================================
echo.
set "PATH=C:\Program Files\Git\cmd;%PATH%"

echo Target Repository: https://github.com/rajputmonu1436-svg/erp-crm-portal.git
echo Branch: main
echo.
echo Pushing local project code...
git push -u origin main --force

echo.
echo ====================================================
echo   SUCCESS! Refresh your browser on GitHub.
echo ====================================================
pause
