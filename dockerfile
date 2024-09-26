# Usar una imagen base de Node.js
FROM node:18

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias de la aplicación
RUN npm install --only=production

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto en el que la API estará escuchando
EXPOSE 3000

# Establecer las variables de entorno necesarias
ENV NODE_ENV=production
ENV OPENAI_API_KEY=your_openai_api_key
ENV MY_API_KEY=your_custom_api_key

# Comando para ejecutar la aplicación
CMD ["node", "index.js"]
