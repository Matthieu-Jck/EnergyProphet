FROM node:20 AS build
WORKDIR /app
COPY frontend/package*.json ./frontend/
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm ci
RUN npm run build --if-present


FROM nginx:stable-alpine AS runtime
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]