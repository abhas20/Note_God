FROM node:20-alpine

WORKDIR /app

COPY socket-server/package*.json ./


RUN npm install

COPY socket-server/. .
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "dev"]