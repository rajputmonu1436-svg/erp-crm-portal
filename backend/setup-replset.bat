@echo off
echo ============================================
echo   MongoDB Replica Set Setup (Admin Required)
echo ============================================
echo.

REM Update mongod.cfg to add replication config
set "CFG=C:\Program Files\MongoDB\Server\8.2\bin\mongod.cfg"

findstr /C:"replSetName" "%CFG%" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Replica set already configured in mongod.cfg
) else (
    echo [*] Adding replication config to mongod.cfg...
    echo. >> "%CFG%"
    echo replication: >> "%CFG%"
    echo   replSetName: rs0 >> "%CFG%"
    echo [OK] Updated mongod.cfg
)

echo [*] Restarting MongoDB service...
net stop MongoDB
timeout /t 2 /nobreak >nul
net start MongoDB
timeout /t 3 /nobreak >nul

echo [*] Initializing replica set...
"C:\Program Files\MongoDB\Server\8.2\bin\mongosh.exe" --eval "rs.initiate()" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [*] mongosh not found, trying with mongos...
    "C:\Program Files\MongoDB\Server\8.2\bin\mongo.exe" --eval "rs.initiate()" 2>nul
)

echo.
echo ============================================
echo   DONE! MongoDB is now a replica set.
echo   You can close this window.
echo ============================================
pause
