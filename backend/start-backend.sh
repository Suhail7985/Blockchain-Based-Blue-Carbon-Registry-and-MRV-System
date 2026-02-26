#!/bin/bash

echo "Starting Blue Carbon Registry Backend..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ".env file not found!"
    echo "Copying from .env.example..."
    cp .env.example .env
    echo ""
    echo "Please edit .env file and add your configuration:"
    echo "- MONGODB_URI"
    echo "- EMAIL_USER"
    echo "- EMAIL_PASS"
    echo ""
    exit 1
fi

echo "Starting server..."
echo ""
npm run dev
