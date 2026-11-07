# Build de Vite en una etapa y, en la final, solo dist/ + un servidor Node de
# ~150 líneas cuya única dependencia es el SDK de Jentry (sin dependencias
# propias): de node_modules viaja ese paquete y nada más.
FROM node:22.23.4-alpine AS build
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# En deploycloud la app vive en la raíz del dominio, así que base "/" (el CI de
# GitHub Pages es el que setea VITE_BASE=/viajes/).
RUN npm run build

FROM node:22.23.4-alpine
WORKDIR /app
COPY --from=build /build/dist ./site
COPY --from=build /build/node_modules/@jentry/sdk ./node_modules/@jentry/sdk
COPY server.js .
EXPOSE 3000
CMD ["node", "server.js"]
