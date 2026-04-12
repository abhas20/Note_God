import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import {
  ArrowRight,
  Globe,
  ImageIcon,
  Link,
  Loader2,
  Terminal,
  Wrench,
} from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu'
import { Textarea } from './ui/textarea'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const AVAILABLE_TOOLS = [
  {
    id: 'googleSearch',
    name: 'Google Search',
    description: 'Search the web for the latest information on any topic.',
    icon: Globe,
  },
  {
    id: 'executeCode',
    name: 'Code Execution',
    description: 'Run Python code and return the output via Google.',
    icon: Terminal,
  },
  {
    id: 'search_url',
    name: 'Search URL Context',
    description: 'Provide additional context from a specific URL.',
    icon: Link,
  },
  {
    id: 'generate_image',
    name: 'Generate Image',
    description: 'Generate an image based on a text prompt.',
    icon: ImageIcon,
  },
] as const

type ToolName = (typeof AVAILABLE_TOOLS)[number]['id']

export default function NoteGeneratorScrap() {
  const [input, setInput] = useState('')
  const [enabledTools, setEnabledTools] = useState<ToolName[]>(['googleSearch'])

  // Ref so the memoized transport always reads the latest tools without recreating
  const enabledToolsRef = useRef(enabledTools)
  useEffect(() => {
    enabledToolsRef.current = enabledTools
  }, [enabledTools])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const toggleTool = (tool: ToolName) => {
    setEnabledTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool],
    )
  }

  // Memoized — stable across renders, reads fresh tools via ref at call time
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai-mode/tools',
        fetch: async (url, options) => {
          const existingBody = JSON.parse((options?.body as string) ?? '{}')
          return fetch(url, {
            ...options,
            body: JSON.stringify({
              ...existingBody,
              enabledTools: enabledToolsRef.current,
            }),
          })
        },
      }),
    [],
  )

  const { messages, sendMessage, status } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: (toolCall) => {
      console.log('Tool called:', toolCall)
    },
    onError: (error) => {
      console.error('Error in chat transport:', error)
      toast.error('Error generating AI response. Please try again.', {
        description: error instanceof Error ? error.message : String(error),
        position: 'top-center',
      })
    },
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        console.log('RAW AI OUTPUT PARTS:', lastMessage.parts)
      }
    }
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    await sendMessage({ text: input })
    setInput('')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="text-center">
          Ask AI with Tools
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-[85vh] max-w-4xl flex-col">
        <DialogHeader>
          <DialogTitle>
            Explore the World with power of AI with TOOLs
          </DialogTitle>
          <DialogDescription>
            Just ENABLE the RIGHT Tools and let the AI do the rest!
          </DialogDescription>
        </DialogHeader>

        <div className="custom-scrollbar bg-muted/10 flex-1 overflow-y-auto rounded-md border p-4">
          {messages.length === 0 ? (
            <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
              What do you want to learn today?
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-muted-foreground mb-1 text-xs">
                    {m.role === 'user' ? 'You' : 'Tutor'}
                  </span>

                  <div
                    className={`flex max-w-[85%] flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {m.parts.map((part, index) => {
                      // ── Text part ─────────────────────────────────────────
                      if (part.type === 'text') {
                        return (
                          <div
                            key={index}
                            className={`rounded-lg p-3 text-sm ${
                              m.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background border'
                            }`}
                          >
                            {m.role === 'user' ? (
                              part.text
                            ) : (
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  // Headings
                                  h1: ({ children }) => (
                                    <h1 className="mb-2 text-lg font-bold">
                                      {children}
                                    </h1>
                                  ),
                                  h2: ({ children }) => (
                                    <h2 className="mb-2 text-base font-semibold">
                                      {children}
                                    </h2>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 className="mb-1 text-sm font-semibold">
                                      {children}
                                    </h3>
                                  ),

                                  // Paragraph
                                  p: ({ children }) => (
                                    <p className="mb-2 leading-relaxed last:mb-0">
                                      {children}
                                    </p>
                                  ),

                                  // Bold & italic
                                  strong: ({ children }) => (
                                    <strong className="font-semibold">
                                      {children}
                                    </strong>
                                  ),
                                  em: ({ children }) => (
                                    <em className="italic">{children}</em>
                                  ),

                                  // Inline code
                                  code: ({ children, className }) => {
                                    const isBlock =
                                      className?.includes('language-')
                                    return isBlock ? (
                                      <pre className="bg-muted my-2 overflow-x-auto rounded-md p-3 text-xs leading-relaxed">
                                        <code>{children}</code>
                                      </pre>
                                    ) : (
                                      <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                                        {children}
                                      </code>
                                    )
                                  },

                                  // Lists
                                  ul: ({ children }) => (
                                    <ul className="mb-2 ml-4 list-disc space-y-1">
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="mb-2 ml-4 list-decimal space-y-1">
                                      {children}
                                    </ol>
                                  ),
                                  li: ({ children }) => (
                                    <li className="leading-relaxed">
                                      {children}
                                    </li>
                                  ),

                                  // Blockquote
                                  blockquote: ({ children }) => (
                                    <blockquote className="border-muted-foreground/30 my-2 border-l-2 pl-3 italic opacity-80">
                                      {children}
                                    </blockquote>
                                  ),

                                  // Horizontal rule
                                  hr: () => (
                                    <hr className="border-muted my-3" />
                                  ),

                                  // Links
                                  a: ({ href, children }) => (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary underline underline-offset-2 hover:opacity-80"
                                    >
                                      {children}
                                    </a>
                                  ),

                                  // Tables (from remark-gfm)
                                  table: ({ children }) => (
                                    <div className="my-2 overflow-x-auto rounded-md border">
                                      <table className="w-full text-xs">
                                        {children}
                                      </table>
                                    </div>
                                  ),
                                  th: ({ children }) => (
                                    <th className="bg-muted border-b px-3 py-2 text-left font-semibold">
                                      {children}
                                    </th>
                                  ),
                                  td: ({ children }) => (
                                    <td className="border-b px-3 py-2 last:border-0">
                                      {children}
                                    </td>
                                  ),
                                }}
                              >
                                {part.text}
                              </ReactMarkdown>
                            )}
                          </div>
                        )
                      }

                      // ── Tool parts (dynamic-tool or tool-${name}) ─────────
                      if (
                        part.type === 'dynamic-tool' ||
                        part.type.startsWith('tool-')
                      ) {
                        const toolPart = part as Extract<
                          typeof part,
                          { type: `tool-${string}` }
                        > & {
                          toolName?: string
                          state: string
                          output?: any
                        }

                        const toolName =
                          part.type === 'dynamic-tool'
                            ? (part as any).toolName // DynamicToolUIPart has .toolName
                            : part.type.slice(5) // "tool-generate_image" → "generate_image"

                        const { state } = toolPart
                        const toolOutput =
                          state === 'output-available'
                            ? toolPart.output
                            : undefined

                        let ToolIcon = Wrench
                        let loadingText = 'Working...'
                        let successText = 'Complete'

                        if (toolName === 'google_search') {
                          ToolIcon = Globe
                          loadingText = 'Searching the web...'
                          successText = 'Web search complete'
                        } else if (toolName === 'code_execution') {
                          ToolIcon = Terminal
                          loadingText = 'Running code...'
                          successText = 'Code executed'
                        } else if (toolName === 'search_url') {
                          ToolIcon = Link
                          loadingText = 'Reading webpage...'
                          successText = 'Webpage read successfully'
                        } else if (toolName === 'generate_image') {
                          ToolIcon = ImageIcon
                          loadingText = 'Drawing image...'
                          successText = 'Image generated'
                        }

                        const isPending =
                          state === 'input-streaming' ||
                          state === 'input-available'

                        return (
                          <div
                            key={index}
                            className="flex w-full flex-col gap-2"
                          >
                            {/* Tool status badge */}
                            <div className="bg-muted/50 text-muted-foreground flex w-fit items-center gap-2 rounded-md border p-2 text-xs">
                              <ToolIcon className="h-4 w-4" />
                              {isPending && (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  {loadingText}
                                </span>
                              )}
                              {state === 'output-available' && (
                                <span>{successText}</span>
                              )}
                              {state === 'output-error' && (
                                <span className="text-destructive">
                                  Tool failed
                                </span>
                              )}
                            </div>

                            {/* Generated image */}
                            {state === 'output-available' &&
                              toolName === 'generate_image' &&
                              toolOutput?.imageUrl && (
                                <div className="mt-2 overflow-hidden rounded-md border shadow-sm">
                                  <img
                                    src={toolOutput.imageUrl}
                                    alt="AI Generated"
                                    className="h-auto w-full max-w-md object-cover"
                                  />
                                </div>
                              )}

                            {/* Code execution output */}
                            {state === 'output-available' &&
                              toolName === 'code_execution' &&
                              toolOutput && (
                                <div className="flex w-full flex-col gap-2 font-mono text-xs">
                                  {(toolPart as any).input?.code && (
                                    <div className="overflow-hidden rounded-md border">
                                      <div className="bg-muted flex items-center gap-2 border-b px-3 py-1.5">
                                        <Terminal className="text-muted-foreground h-3 w-3" />
                                        <span className="text-muted-foreground font-sans text-[11px] tracking-wide uppercase">
                                          {(toolPart as any).input?.language ??
                                            'Code'}
                                        </span>
                                      </div>
                                      <pre className="bg-muted/30 overflow-x-auto p-3 text-xs leading-relaxed">
                                        <code>
                                          {(toolPart as any).input.code}
                                        </code>
                                      </pre>
                                    </div>
                                  )}

                                  {/* Output block — outcome and output are flat on toolOutput */}
                                  {toolOutput.outcome && (
                                    <div className="overflow-hidden rounded-md border">
                                      <div className="bg-muted flex items-center gap-2 border-b px-3 py-1.5">
                                        <span
                                          className={`h-2 w-2 rounded-full ${
                                            toolOutput.outcome === 'OUTCOME_OK'
                                              ? 'bg-green-500'
                                              : 'bg-red-500'
                                          }`}
                                        />
                                        <span className="text-muted-foreground font-sans text-[11px] tracking-wide uppercase">
                                          {toolOutput.outcome === 'OUTCOME_OK'
                                            ? 'Output'
                                            : 'Error'}
                                        </span>
                                      </div>
                                      <pre className="overflow-x-auto p-3 text-xs leading-relaxed whitespace-pre-wrap">
                                        {toolOutput.output || '(no output)'}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                        )
                      }

                      return null
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-3 rounded-lg border p-4"
        >
          <Textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (!input.trim() || isLoading) return
                sendMessage({ text: input })
                setInput('')
              }
            }}
            placeholder="Write the topic to search web and generate auto notes..."
            className="border-none bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Wrench className="mr-2 h-3 w-3" />
                    Tools ({enabledTools.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Enable AI Tools</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {AVAILABLE_TOOLS.map((tool) => (
                    <DropdownMenuCheckboxItem
                      key={tool.id}
                      checked={enabledTools.includes(tool.id)}
                      onCheckedChange={() => toggleTool(tool.id)}
                    >
                      <div className="flex items-center gap-2">
                        <tool.icon className="h-4 w-4" />
                        <span>{tool.name}</span>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <span className="text-muted-foreground hidden text-xs sm:inline">
                Press Enter to send
              </span>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
