FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .

# The dummy URL so Prisma can generate the client
ENV DB_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV REDIS_HOST="redis"
ENV REDIS_PORT=6379
ENV REDIS_PASSWORD="psswrd"
ENV GEMINI_API_KEY="dummy_key"
ENV QDRANT_URL="http://qdrant:6333"
ENV HF_API_TOKRN="dummy_token"

# 1. Generate Prisma Client
RUN npx prisma generate

# 2. CHANGED: Run Next.js build directly (skips the migrate deploy step)
RUN npx next build

# 3. Build your worker
# RUN npm run build:worker

EXPOSE 3000

CMD ["npm", "start"]