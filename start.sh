#!/bin/bash
echo "Starting Mohafez Baseet..."
cd "$(dirname "$0")"

# Start backend
cd backend && node src/server.js &
BACKEND_PID=$!

# Start frontend
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo "Backend running on http://localhost:5001"
echo "Frontend running on http://localhost:3000"
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
