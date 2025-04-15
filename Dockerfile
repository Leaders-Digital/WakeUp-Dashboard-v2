FROM node:18-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy package files for better caching
COPY package*.json ./

# Install dependencies with clean cache
RUN npm ci --silent

# Bundle app source
COPY . .

# Set environment variables for build time
ARG REACT_APP_API_KEY=AIzaSyD-1X6JQJ3Q
ARG REACT_APP_API_URL=https://wakeup-server.onrender.com/

ENV REACT_APP_API_KEY=${REACT_APP_API_KEY}
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build the app
RUN npm run build

# Use nginx to serve the static files
FROM nginx:alpine

# Copy build files
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

# Create a default nginx config with proper SPA routing
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Security headers \
    add_header X-Content-Type-Options "nosniff"; \
    add_header X-XSS-Protection "1; mode=block"; \
    add_header X-Frame-Options "SAMEORIGIN"; \
    add_header Referrer-Policy "strict-origin-when-cross-origin"; \
    add_header Content-Security-Policy "default-src '\''self'\''; connect-src '\''self'\'' https://wakeup-server.onrender.com/; img-src '\''self'\'' data: blob:; style-src '\''self'\'' '\''unsafe-inline'\''; script-src '\''self'\'' '\''unsafe-inline'\'' '\''unsafe-eval'\''; font-src '\''self'\'' data:"; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    # Cache static assets \
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ { \
        expires 7d; \
        add_header Cache-Control "public, max-age=604800, immutable"; \
    } \
    # Disable cache for index.html \
    location = /index.html { \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]