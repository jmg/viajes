# Build de Vite en una etapa y, en la final, solo dist/ + un servidor Node de
# ~100 líneas sin dependencias (nada de node_modules en la imagen que corre).
FROM node:22-alpine AS build
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# En deploycloud la app vive en la raíz del dominio, así que base "/" (el CI de
# GitHub Pages es el que setea VITE_BASE=/viajes/).
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /build/dist ./site
COPY server.js .
EXPOSE 3000
CMD ["node", "server.js"]
