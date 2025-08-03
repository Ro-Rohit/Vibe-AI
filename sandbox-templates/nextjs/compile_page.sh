#!/bin/bash

function ping_server() {
  counter=0
  while true; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
    if [[ "$response" == "200" ]]; then
      echo "✅ Server is ready!"
      break
    fi

    ((counter++))
    if (( counter % 20 == 0 )); then
      echo "⏳ Waiting for server to start..."
    fi

    sleep 0.2
  done
}

# Change to your Next.js app directory
cd /app

# Start the dev server in background
npx next dev --turbopack &
NEXT_PID=$!

# Wait for the server to be ready
ping_server

# Keep container running by waiting on the dev server
wait $NEXT_PID
