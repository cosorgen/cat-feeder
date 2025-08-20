@echo off

REM Build script for the Cat Feeder TypeScript project

echo Building Cat Feeder TypeScript project...

REM Clean previous build
echo Cleaning previous build...
if exist dist rmdir /s /q dist

REM Compile TypeScript
echo Compiling TypeScript...
npx tsc

if %errorlevel% equ 0 (
    echo ✅ Build completed successfully!
    echo 📁 Compiled files are in the 'dist' directory
    echo 🚀 You can now open index.html in your browser
) else (
    echo ❌ Build failed!
    exit /b 1
)
