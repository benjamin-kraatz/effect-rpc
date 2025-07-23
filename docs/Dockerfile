# syntax=docker/dockerfile:1

# Build
FROM node:18-alpine AS build
WORKDIR /app
COPY guides/package.json guides/pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm i --frozen-lockfile
COPY guides .
RUN pnpm build

# Deploy
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]