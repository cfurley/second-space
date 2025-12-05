@echo off
REM Test script for backend authentication lockout
REM This demonstrates that the backend now enforces progressive lockouts

set URL=http://localhost:8080/user/authentication

echo Running authentication attempts...
echo.

echo Attempt 1:
curl -X POST %URL% -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"wrong1\"}"
echo.
echo.

echo Attempt 2:
curl -X POST %URL% -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"wrong2\"}"
echo.
echo.

echo Attempt 3:
curl -X POST %URL% -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"wrong3\"}"
echo.
echo.

echo Attempt 4:
curl -X POST %URL% -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"wrong4\"}"
echo.
echo.

echo Attempt 5 (should trigger 1 minute lockout):
curl -X POST %URL% -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"wrong5\"}"
echo.
echo.

echo Attempt 6 (should return 429 - Too many attempts):
curl -X POST %URL% -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"wrong6\"}"
echo.
echo.

echo Done! The 5th attempt should show 429 Too many login attempts.
echo The 6th attempt should also show 429 with remaining time.
