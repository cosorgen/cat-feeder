#!/bin/bash

# Build script for the Cat Feeder TypeScript project

echo "Building Cat Feeder TypeScript project..."

# Clean previous build
echo "Cleaning previous build..."
rm -rf dist

# Compile TypeScript
echo "Compiling TypeScript..."
npx tsc

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Compiled files are in the 'dist' directory"
    echo "🚀 You can now open index.html in your browser"
else
    echo "❌ Build failed!"
    exit 1
fi
