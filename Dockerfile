# =========================
# BUILD STAGE
# =========================
FROM node:16 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build --prod

# =========================
# NGINX STAGE - NON ROOT
# =========================
FROM nginxinc/nginx-unprivileged:stable-alpine

COPY --from=build /app/dist/FrontTest /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]