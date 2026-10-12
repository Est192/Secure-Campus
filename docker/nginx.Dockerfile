FROM node:22-alpine AS frontend-build

WORKDIR /workspace
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

FROM nginx:1.29-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY backend/public/index.php /var/www/html/public/index.php
COPY --from=frontend-build /workspace/dist/ /usr/share/nginx/html/

EXPOSE 80
