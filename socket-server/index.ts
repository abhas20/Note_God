import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import { createServer } from "http";
import app from "./app.js";
import SocketServer from "./services/socket-server.js";

const PORT = process.env.PORT;
// try {
//   console.log("DB_URL present?", !!process.env.DB_URL);
//   await prisma.$connect();
//   console.log(
//     " Prisma connected. Available model keys:",
//     Object.keys(prisma).slice(0, 50),
//   );
// } catch (err) {
//   console.error(" Prisma connect error:", err);
//   process.exit(1);
// }

async function init() {
  const socketServer = new SocketServer();
  const httpServer = createServer(app);

  socketServer.io.attach(httpServer);
  socketServer.initServer();
  httpServer.listen(PORT, () => {
    console.log(`Socket server is running on port ${PORT}`);
  });
}

init();
