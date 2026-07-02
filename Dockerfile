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
# NGINX STAGE
# =========================
FROM nginx:alpine

COPY --from=build /app/dist/FrontTest /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]