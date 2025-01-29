# Usa una imagen oficial de Node.js como base
FROM node:21-alpine3.18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia todo el código fuente al contenedor
COPY . .

# Expone el puerto en el que el microservicio escucha
EXPOSE 3000

# Comando para ejecutar el microservicio
#CMD ["node", "src/index.js"]
CMD ["npm", "run", "start"] 