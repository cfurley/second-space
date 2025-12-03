FROM node:18-alpine AS build
WORKDIR /app

# Accept a build-arg so CI / docker-compose can inject the backend URL at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Install dependencies based on package-lock for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Copy the rest and build
COPY . ./
RUN npm run build

FROM nginx:stable-alpine AS runtime
EXPOSE 80

# Copy built assets from Vite output directory (vite.config.ts uses `build`)
COPY --from=build /app/build /usr/share/nginx/html

# If a custom nginx config was provided in the project, use it
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]