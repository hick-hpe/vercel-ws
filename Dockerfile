FROM node:20-alpine
WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY server.js index.html ./

EXPOSE 80
CMD ["npm", "start"]
