FROM node:22 AS build
WORKDIR /app

# Copy package metadata first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install dependencies. Use npm ci when a lockfile is present for reproducible installs.
RUN npm ci --prefer-offline --no-audit --progress=false || npm install --prefer-offline --no-audit --progress=false

# Copy the rest of the source (excluded files come from .dockerignore)
COPY . .

# Set API URL for Docker Compose local development
ENV VITE_API_URL=http://localhost:8080

# Build the production assets
RUN npm run build

FROM nginx
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]