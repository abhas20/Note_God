'use client'
import { logger } from '@/lib/logger'
import React, { createContext, useCallback, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketProviderProps {
  children: React.ReactNode
}

interface Sender {
  id: string
  email: string
  imgUrl?: string | null
}

interface Message {
  id: string
  content: string
  senderId: string
  groupId: string | null
  sender: Sender
  createdAt: string
}

interface ISocketContextType {
  socket: Socket | undefined
  sendMessage: (
    message: string,
    senderID: string,
    groupId: string | null,
  ) => Promise<void>
  deleteMessage: (messageId: string, senderID: string) => Promise<void>
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  activeRoom: string
  joinRoom: (roomId: string) => void
}

export const SocketContext = createContext<ISocketContextType | null>(null)

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
}: SocketProviderProps) => {
  const [_socketInstance, setSocket] = useState<Socket>()
  const [messages, setMessages] = useState<Message[]>([])
  const [activeRoom, setActiveRoom] = useState<string>('global')

  const joinRoom = useCallback((roomId: string) => {
    setActiveRoom(roomId)
  }, [])

  const sendMessage = useCallback(
    async (content: string, senderID: string, groupId: string | null) => {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            senderId: senderID,
            groupId: groupId && groupId !== 'global' ? groupId : null,
          }),
        })

        if (!response.ok) throw new Error('Failed to send message')
      } catch (error) {
        // console.error('Error sending message:', error)
        logger.error(
          {
            event: 'SEND_MESSAGE_FAILED',
            content,
            senderID,
            groupId,
            error,
          },
          'Error sending message',
        )
      }
    },
    [],
  )

  const deleteMessage = useCallback(
    async (messageId: string, senderID: string) => {
      try {
        const response = await fetch('/api/messages', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, senderId: senderID }),
        })

        if (!response.ok) throw new Error('Failed to delete message')
      } catch (error) {
        // console.error('Error deleting message:', error)
        logger.error(
          {
            event: 'DELETE_MESSAGE_FAILED',
            messageId,
            senderID,
            error,
          },
          'Error deleting message',
        )
      }
    },
    [],
  )

  // Receive message from socket
  const onMessageReceived = useCallback((message: Message) => {
    // console.log('Real-time message received:', message)
    logger.info({ message }, 'Real-time message received')
    setMessages((prev) => [...prev, message])
  }, [])

  const onDeleteReceived = useCallback((payload: { messageId: string }) => {
    // console.log('Real-time delete received:', payload)
    logger.info({ payload }, 'Real-time delete received')
    setMessages((prev) => prev.filter((msg) => msg.id !== payload.messageId))
  }, [])

  const socketServerUrl =
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:4000'

  // Manage connection lifecycle
  useEffect(() => {
    const _socket = io(socketServerUrl, {
      withCredentials: true,
    })
    _socket.on('message', onMessageReceived)
    _socket.on('delete:message', onDeleteReceived)
    setSocket(_socket)

    return () => {
      _socket.off('message', onMessageReceived)
      _socket.off('delete:message', onDeleteReceived)
      // console.log('Socket disconnected')
      logger.info('Socket disconnected')
      setSocket(undefined)
      _socket.disconnect()
    }
  }, [onMessageReceived, onDeleteReceived, socketServerUrl])

  // Manage room joining dynamically on room change or reconnect
  useEffect(() => {
    if (_socketInstance) {
      _socketInstance.emit('join:room', { roomId: activeRoom })
      // console.log(`Emitted join:room for room: ${activeRoom}`)
      logger.info(
        { event: 'JOIN_ROOM_EVENT', roomId: activeRoom },
        'Emitted join:room',
      )
    }
  }, [_socketInstance, activeRoom])

  return (
    <SocketContext.Provider
      value={{
        socket: _socketInstance,
        sendMessage,
        deleteMessage,
        messages,
        setMessages,
        activeRoom,
        joinRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
