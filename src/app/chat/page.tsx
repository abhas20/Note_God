'use client'

import { getCurrentUser } from '@/action/user'
import CommunityChat from '@/components/ComunityChat'
import { DeleteMessageDialog } from '@/components/DeleteMessageDialog'
import { DeleteGroupDialog } from '@/components/DeleteGroupDialog'
import { useSocket } from '@/hooks/useSocket'
import { Loader2, Plus, Users, MessageSquare, LogIn, Menu, ChevronLeft } from 'lucide-react'
import React, { useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type CurrentUser = {
  id: string
  email: string
  imgUrl: string | null
}

type Group = {
  id: string
  name: string
  description: string | null
  creatorId: string
  createdAt: string
  _count?: {
    members: number
  }
}

function CommunityPage() {
  const [user, setUser] = useState<CurrentUser>()
  const [isFetchingUser, setIsFetchingUser] = useState<boolean>(true)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  // Group related states
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([])
  const [discoverGroups, setDiscoverGroups] = useState<Group[]>([])
  const [activeGroup, setActiveGroup] = useState<Group | null>(null) // null = community chat
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [isDeletingGroup, setIsDeletingGroup] = useState<string | null>(null)

  // Sidebar collapsibility state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)

  const scrollRef = useRef<HTMLDivElement>(null)

  const { socket, sendMessage, messages, deleteMessage, setMessages, activeRoom, joinRoom } = useSocket()

  // Handle real-time group events from sockets
  useEffect(() => {
    if (!socket) return

    const handleGroupDeleted = ({ groupId }: { groupId: string }) => {
      // Remove from lists
      setJoinedGroups((prev) => prev.filter((g) => g.id !== groupId))
      setDiscoverGroups((prev) => prev.filter((g) => g.id !== groupId))

      // If user was actively viewing this deleted group, redirect to community chat
      if (activeRoom === groupId) {
        toast.info('This group was deleted by the creator.')
        handleSelectRoom('global')
      }
    }

    const handleGroupCreated = ({ group }: { group: Group }) => {
      // If the current user is the creator of the group, do not add it to discover list
      if (group.creatorId === user?.id) {
        return
      }

      // Add to discover list if it's not already in it
      setDiscoverGroups((prev) => {
        if (prev.some((g) => g.id === group.id)) return prev
        return [...prev, group]
      })
    }

    socket.on('group:deleted', handleGroupDeleted)
    socket.on('group:created', handleGroupCreated)

    return () => {
      socket.off('group:deleted', handleGroupDeleted)
      socket.off('group:created', handleGroupCreated)
    }
  }, [socket, activeRoom, user])

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Fetch current authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser()
        if ('currUser' in res && res.currUser) {
          setUser(res.currUser)
        } else if ('errorMessage' in res) {
          console.error('Error fetching user:', res.errorMessage)
          toast.error(res.errorMessage)
        }
      } catch (error) {
        console.error('Unexpected error:', error)
      } finally {
        setIsFetchingUser(false)
      }
    }
    fetchUser()
  }, [])

  // Fetch groups list
  const fetchGroups = async () => {
    if (!user?.id) return
    try {
      // Fetch user's joined groups
      const joinedRes = await fetch(`/api/groups?userId=${user.id}&type=joined`)
      if (joinedRes.ok) {
        const data = await joinedRes.json()
        setJoinedGroups(data.groups || [])
      }

      // Fetch discoverable groups
      const discoverRes = await fetch(`/api/groups?userId=${user.id}&type=discover`)
      if (discoverRes.ok) {
        const data = await discoverRes.json()
        setDiscoverGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    }
  }

  // Fetch groups once user is loaded
  useEffect(() => {
    if (user?.id) {
      fetchGroups()
    }
  }, [user])

  // Select room & fetch previous messages
  const handleSelectRoom = (room: Group | 'global') => {
    if (room === 'global') {
      setActiveGroup(null)
      joinRoom('global')
    } else {
      setActiveGroup(room)
      joinRoom(room.id)
    }

    startTransition(async () => {
      try {
        const roomId = room === 'global' ? 'global' : room.id
        const response = await fetch(`/api/fetch-prev-messages?groupId=${roomId}`)
        if (!response.ok) throw new Error('Failed to fetch')

        const data = await response.json()
        setMessages(data.messages || [])
      } catch (error) {
        console.error('Failed to fetch previous messages', error)
        toast.error('Could not load chat history')
      }
    })

    // On mobile, close sidebar automatically after selecting room
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }

  // Initial load
  useEffect(() => {
    handleSelectRoom('global')
  }, [])

  // Send message
  const handleSentMessage = async (msg: string) => {
    if (!user?.id) {
      toast.error('You must be logged in')
      return
    }

    await sendMessage(msg, user.id, activeRoom)
  }

  // Delete message
  const handleDeleteMessage = async (messageId: string, senderId: string) => {
    if (!user?.id || senderId !== user.id) {
      toast.error('You can only delete your own messages')
      return
    }
    try {
      setIsDeleting(true)
      await deleteMessage(messageId, senderId)
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Failed to delete message')
    } finally {
      setIsDeleting(false)
    }
  }

  // Delete Group
  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!user?.id) {
      toast.error('You must be logged in')
      return
    }

    try {
      setIsDeletingGroup(groupId)
      const res = await fetch('/api/groups', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          userId: user.id,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Group "${groupName}" deleted successfully!`)
        // Fallback to global community chat if active group was deleted
        if (activeGroup?.id === groupId) {
          handleSelectRoom('global')
        }
        await fetchGroups()
      } else {
        toast.error(data.message || 'Failed to delete group')
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      toast.error('Something went wrong')
    } finally {
      setIsDeletingGroup(null)
    }
  }

  // Handle group creation
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim() || !user?.id) return

    try {
      setIsCreatingGroup(true)
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDesc.trim(),
          creatorId: user.id,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Group "${newGroupName}" created successfully!`)
        setNewGroupName('')
        setNewGroupDesc('')
        setIsCreateOpen(false)
        await fetchGroups()
        handleSelectRoom(data.group)
      } else {
        toast.error(data.message || 'Failed to create group')
      }
    } catch (error) {
      console.error('Failed to create group:', error)
      toast.error('Something went wrong')
    } finally {
      setIsCreatingGroup(false)
    }
  }

  // Handle joining a group
  const handleJoinGroup = async (group: Group) => {
    if (!user?.id) {
      toast.error('You must be logged in to join groups')
      return
    }

    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: group.id,
          userId: user.id,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Successfully joined "${group.name}"!`)
        await fetchGroups()
        handleSelectRoom(data.group)
      } else {
        toast.error(data.message || 'Failed to join group')
      }
    } catch (error) {
      console.error('Failed to join group:', error)
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="relative flex h-[85vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="absolute inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div
        className={`absolute md:relative inset-y-0 left-0 z-30 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-zinc-800 dark:bg-zinc-950 md:bg-gray-50/50 md:dark:bg-zinc-900/30 ${
          isSidebarOpen
            ? 'w-80 translate-x-0 opacity-100 border-r'
            : 'w-0 -translate-x-full opacity-0 pointer-events-none md:-translate-x-0 md:w-0 md:border-r-0 overflow-hidden'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-800">
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Channels & Groups
          </span>

          <div className="flex items-center gap-1">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border border-gray-200 dark:border-zinc-800"
                  title="Create Group"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleCreateGroup}>
                  <DialogHeader>
                    <DialogTitle>Create a new group</DialogTitle>
                    <DialogDescription>
                      Gather users together with a common project or interest.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="groupName" className="text-sm font-medium">
                        Group Name
                      </label>
                      <Input
                        id="groupName"
                        placeholder="e.g. Next.js Developers"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="groupDesc" className="text-sm font-medium">
                        Description (optional)
                      </label>
                      <Input
                        id="groupDesc"
                        placeholder="What is this group about?"
                        value={newGroupDesc}
                        onChange={(e) => setNewGroupDesc(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreatingGroup}>
                      {isCreatingGroup ? 'Creating...' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="h-8 w-8 rounded-md"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Channels/Groups list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {/* Default Community Section */}
          <div className="space-y-1">
            <button
              onClick={() => handleSelectRoom('global')}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                activeGroup === null
                  ? 'bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-900 dark:hover:text-gray-200'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Community Chat</span>
            </button>
          </div>

          {/* User's Joined Groups */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-[11px] font-semibold tracking-wider text-gray-400 dark:text-zinc-500 uppercase">
                My Groups
              </span>
            </div>
            {joinedGroups.length === 0 ? (
              <p className="px-3 text-xs text-gray-400 dark:text-zinc-500">
                You haven't joined any groups yet.
              </p>
            ) : (
              joinedGroups.map((group) => (
                <div
                  key={group.id}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    activeGroup?.id === group.id
                      ? 'bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-900 dark:hover:text-gray-200'
                  }`}
                >
                  <button
                    onClick={() => handleSelectRoom(group)}
                    className="flex flex-1 items-center gap-3 min-w-0 text-left"
                  >
                    <Users className="h-4 w-4 shrink-0" />
                    <span className="truncate">{group.name}</span>
                  </button>

                  {user?.id === group.creatorId && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0">
                      <DeleteGroupDialog
                        groupName={group.name}
                        onConfirm={() => handleDeleteGroup(group.id, group.name)}
                        isDeleting={isDeletingGroup === group.id}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Discoverable Groups */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-[11px] font-semibold tracking-wider text-gray-400 dark:text-zinc-500 uppercase">
                Discover Groups
              </span>
            </div>
            {discoverGroups.length === 0 ? (
              <p className="px-3 text-xs text-gray-400 dark:text-zinc-500">
                No new groups available.
              </p>
            ) : (
              discoverGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-zinc-900"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                      {group.name}
                    </span>
                    {group.description && (
                      <span className="text-xs text-gray-400 dark:text-zinc-500 truncate">
                        {group.description}
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => handleJoinGroup(group)}
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs border-blue-500/30 text-blue-600 hover:bg-blue-50 dark:border-blue-500/20 dark:text-blue-400 dark:hover:bg-zinc-800 shrink-0"
                  >
                    <LogIn className="h-3 w-3 mr-1" />
                    Join
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-950">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-zinc-800">
          {/* Toggle Sidebar Button */}
          {!isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="h-9 w-9 border border-gray-200 dark:border-zinc-800 shrink-0"
              title="Expand Sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {activeGroup === null ? (
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Community Chat
              </h2>
              <p className="text-xs text-gray-400 dark:text-zinc-500">
                A public channel where anyone can interact.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {activeGroup.name}
              </h2>
              {activeGroup.description ? (
                <p className="text-xs text-gray-400 dark:text-zinc-500">
                  {activeGroup.description}
                </p>
              ) : (
                <p className="text-xs text-gray-400 dark:text-zinc-500">
                  Welcome to the {activeGroup.name} group chat.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Message Feed */}
        {isFetchingUser || isPending ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden p-4">
            <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-2">
              {messages.length === 0 && (
                <p className="mt-10 text-center text-gray-400 dark:text-zinc-500">
                  No messages yet. Say hello!
                </p>
              )}

              {messages.map((msg, index) => {
                const isCurrentUser = msg.sender.id === user?.id
                const userImage =
                  msg.sender.imgUrl ||
                  'https://th.bing.com/th/id/OIP.8REM5cu_BoBMq5wF85yYAwHaHa?w=186&h=186&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
                const userEmail = msg.sender?.email || 'Unknown'

                return (
                  <div
                    key={msg.id || index}
                    className={`flex w-full ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex max-w-[70%] flex-col gap-1 ${
                        isCurrentUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`relative rounded-xl px-4 py-2 text-sm shadow-sm ${
                          isCurrentUser
                            ? 'rounded-tr-none bg-blue-600 text-white'
                            : 'rounded-tl-none bg-gray-100 text-gray-800 dark:bg-zinc-900 dark:text-gray-100'
                        } `}
                      >
                        <div
                          className={`flex items-center gap-2 mb-1 ${
                            isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                          }`}
                        >
                          <img
                            src={userImage}
                            alt="Avatar"
                            className="h-6 w-6 rounded-full border border-gray-200 object-cover dark:border-zinc-800"
                          />
                          <span className="text-[10px] opacity-75">
                            {isCurrentUser ? 'You' : userEmail}
                          </span>
                        </div>
                        <p className="leading-relaxed break-words font-light">
                          {msg.content}
                        </p>

                        {isCurrentUser && (
                          <div className="absolute top-2 -left-8">
                            <DeleteMessageDialog
                              onConfirm={() => handleDeleteMessage(msg.id, msg.senderId)}
                              isDeleting={isDeleting}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={scrollRef} />
            </div>

            {/* Message input */}
            <div className="mt-4">
              <CommunityChat handleSendMessage={handleSentMessage} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommunityPage
