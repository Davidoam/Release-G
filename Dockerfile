FROM node:20-alpine

WORKDIR /desktop/Release-G

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
