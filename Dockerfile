FROM node:18-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy package files for better caching
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

# Set environment variables
ENV REACT_APP_API_KEY=AIzaSyD-1X6JQJ3Q
ENV REACT_APP_API_URL=https://wakeup-server.onrender.com/

# Build the app
RUN npm run build

# Use nginx to serve the static files
FROM nginx:alpine
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

# Create a default nginx config
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
