import { Server } from "socket.io";
import {Redis} from 'ioredis';
// import {prisma} from "@db/prisma.js";

const pub= new Redis({
    host: process.env.REDIS_HOST || "localhost",  //when not using docker
    // host: process.env.REDIS_HOST || "redis",   //when using docker
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || "psswrd",
})
const sub= new Redis({
    host: process.env.REDIS_HOST || "localhost",  //when not using docker
    // host: "redis",   //when using docker
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || "psswrd",
})

//psswrd

pub.on("error", (err) => console.error("Redis Pub error:", err));
sub.on("error", (err) => console.error("Redis Sub error:", err));

class SocketServer{
    private _io: Server; // Socket.IO server instance
    // private prisma: any;
    constructor(){
        console.log("Socket server is initializing...");
        this._io = new Server({
          cors: {
            origin: ["http://localhost:3000"],
            credentials: true,
          },
        });
        console.log("Socket server initialized successfully.");
        sub.subscribe("MESSAGES", (err, count) => {
          if (err) {
            console.error("Failed to subscribe:", err);
          } else {
            console.log(`Subscribed successfully to ${count} channel(s).`);
          }
        });
    }
    public initServer() {
        this._io.on("connection", (socket) => {
            console.log(`New client connected: ${socket.id}`);

            // Handle disconnection
            socket.on("disconnect", () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
            socket.on("send:message", async({content, senderId,email,imgUrl}
                :{content:string, senderId:string, email:string, imgUrl:string | null}) => {
                try {
                    if (!content || !senderId) {
                        console.error("Invalid message data:");
                        return;
                    }
                    // console.log("Message created and published:", content, senderId);
                    await pub.publish("MESSAGES",JSON.stringify({content,senderId,email,imgUrl}));

                    console.log(content, senderId);
                    
                } catch (error) {
                    console.error("Error creating message:", error);
                    
                }
            })
        });

        sub.on("message",(channel, message)=>{
            if(channel==="MESSAGES"){
                if (!message) {
                    console.error("Received empty message from Redis");
                    return;
                }
                // console.log("Message received from Redis:", JSON.parse(message));
                this.io.emit("message", message);
            }
        })
    }

    get io(): Server {
        return this._io;
    }
}

export default SocketServer;
// npx prisma generate --schema=../../src/db/schema.prisma   
// npx prisma migrate dev --name init --schema=../../src/db/schema.prisma(not need if done before)