#!/bin/bash

# Navigate to the directory where the client application is located
cd client/

# Install dependencies if needed
# npm install

# Run the client application
npm run dev &

# Navigate to the directory where the server application is located
cd ../server/

# Install dependencies if needed
#npm install

# Run the server application
npm run server &
