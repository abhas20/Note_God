import { Queue } from "bullmq";

export const queue = new Queue("file-upload-queue", {
  connection: {
    host: process.env.REDIS_HOST || "localhost", // change to redis if using docker-compose
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD || "psswrd",
  },
});
