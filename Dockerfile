FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps


COPY . .
RUN npx prisma generate

# RUN npm run migrate

RUN npm run build
RUN npm run build:worker

EXPOSE 3000

CMD ["npm", "start"]
