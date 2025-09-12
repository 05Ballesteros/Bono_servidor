# Etapa de build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . . 
RUN npm run build

# Etapa final
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

# Copiar la carpeta de archivos al contenedor (Excel, etc.)
COPY files ./files

# Copiar los archivos de compilación desde el builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/*.json .

EXPOSE 6000
CMD ["node", "dist/main"]
