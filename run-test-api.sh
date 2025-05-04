#!/bin/bash

# Export the API URL environment variable for Next.js
export NEXT_PUBLIC_API_URL=http://localhost:4040

# Run the test API and Next.js dev server
bun run dev:test-api 