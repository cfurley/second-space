FROM node:22 AS build
WORKDIR /app
COPY ./package.json ./
COPY . ./

RUN npm cache clean --force
RUN rm -rf node_modules package-lock.json
RUN npm install

# Set API URL for Docker Compose local development
ENV VITE_API_URL=http://localhost:8080

RUN npm run build

FROM nginx
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]