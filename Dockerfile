FROM node:18-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy package files for better caching
COPY package*.json ./

# Install dependencies with clean cache
RUN npm install 

# Set environment variables for build time
ARG REACT_APP_API_KEY=AIzaSyD-1X6JQJ3Q
ARG REACT_APP_API_URL=https://api.wakeup-cosmetics.tn/

# Make them available as ENV variables
ENV REACT_APP_API_KEY=$REACT_APP_API_KEY
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Bundle app source
COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]
