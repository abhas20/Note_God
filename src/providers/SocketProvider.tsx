'use client';
import { createContext, useCallback, useEffect, useState } from "react";
import {io, Socket} from 'socket.io-client';

interface SocketProviderProps {
  children: React.ReactNode;
}

interface ISocketContextType {
    sendMessage:(message:string,senderID:string, email:string, imgUrl:string | null )=>void
    messages:any[];
}

export const SocketContext= createContext<ISocketContextType | null>(null);

export const SocketProvider:React.FC<SocketProviderProps> = ({children}:SocketProviderProps)=>{
    const [socket, setSocket] = useState<Socket>();
    const [messages, setMessages] = useState<any[]>([]);

    const sendMessage: ISocketContextType["sendMessage"] = useCallback(
      (
        message: string,
        senderID: string,
        email: string,
        imgUrl: string | null,
      ) => {
        console.log(`Sending message: ${message} from sender: ${senderID}`);
        if (socket) {
          socket.emit("send:message", {
            content: message,
            senderId: senderID,
            email,
            imgUrl,
          });
          console.log(`Message sent: ${message}`);
        } else {
          console.error("Socket is not connected");
        }
      },
      [socket],
    );

    const recieiveMessage=useCallback(async (message:any)=>{
      
        console.log("Received message:", message);
        const parsedMessage = JSON.parse(message);
        setMessages((prevMessages) => [...prevMessages, parsedMessage]);
        
        try {
          const response = await fetch('/api/save-message', {
            method: 'POST',
            headers:{
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              content: parsedMessage.content,
              senderId: parsedMessage.senderId
            })
          })

          if (!response.ok) {
            throw new Error('Failed to save message');
          }
        } catch (error) {
          console.log("Error in saving messages",error);
        }
        
    },[]);

    useEffect(()=>{
        const _socket= io("http://localhost:4000",{
            withCredentials: true,
        })
        _socket.on("message", recieiveMessage);
        setSocket(_socket);

        return ()=>{
            _socket.disconnect();
            _socket.off("message", recieiveMessage);
            console.log("Socket disconnected");
            setSocket(undefined);
        }
    },[]);

    return(
        <SocketContext.Provider value={{sendMessage,messages}}>
            {children}
        </SocketContext.Provider>
    )
}