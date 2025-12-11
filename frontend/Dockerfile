# Build stage
FROM node:20 AS build

WORKDIR /app

# Only copy package files first (better caching)
COPY package*.json ./
RUN npm ci

# Copy rest of the app
COPY . .

# Build Vite/React app
RUN npm run build

# Runtime stage
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
