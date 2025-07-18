#!/bin/bash

# Script to run the Zone Calculator locally
# This script will start an HTTP server to serve the app

echo "🚇 Zone Calculator - Local Server"
echo "================================="
echo

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "Starting Python HTTP server..."
    echo "Open http://localhost:8000 in your browser"
    echo "Press Ctrl+C to stop"
    echo
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Starting Python HTTP server..."
    echo "Open http://localhost:8000 in your browser"
    echo "Press Ctrl+C to stop"
    echo
    python -m http.server 8000
# Check if Node.js is available
elif command -v node &> /dev/null; then
    echo "Starting Node.js HTTP server..."
    echo "Open http://localhost:8080 in your browser"
    echo "Press Ctrl+C to stop"
    echo
    npx http-server
# Check if PHP is available
elif command -v php &> /dev/null; then
    echo "Starting PHP HTTP server..."
    echo "Open http://localhost:8000 in your browser"
    echo "Press Ctrl+C to stop"
    echo
    php -S localhost:8000
else
    echo "❌ No suitable HTTP server found!"
    echo "Please install one of the following:"
    echo "- Python 3: python3 -m http.server 8000"
    echo "- Node.js: npx http-server"
    echo "- PHP: php -S localhost:8000"
    echo
    echo "Or use any other HTTP server to serve this directory"
    exit 1
fi