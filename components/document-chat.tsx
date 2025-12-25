"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Bot, User, Loader2, MoreVertical, Copy, Reply, Trash2, Flag, MoreHorizontal, UserMinus2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
}

interface DocumentChatProps {
    documentText: string
}

// Helper components from HextaUI design
type StatusType = "online" | "dnd" | "offline";
const STATUS_COLORS: Record<StatusType, string> = {
    online: "bg-green-500",
    dnd: "bg-red-500",
    offline: "bg-gray-400",
};

function StatusBadge({ status }: { status: StatusType }) {
    return (
        <span
            aria-label={status}
            className={cn(
                "inline-block size-3 rounded-full border-2 border-background",
                STATUS_COLORS[status]
            )}
            title={status.charAt(0).toUpperCase() + status.slice(1)}
        />
    );
}

function UserActionsMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    aria-label="User actions"
                    className="border-muted-foreground/30"
                    size="icon"
                    type="button"
                    variant="outline"
                >
                    <MoreVertical
                        aria-hidden="true"
                        className="size-4"
                        focusable="false"
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-36 rounded-lg bg-popover p-1 shadow-xl">
                <div className="flex flex-col gap-1">
                    <Button
                        className="w-full justify-start gap-2 rounded bg-transparent text-rose-600 hover:bg-accent"
                        size="sm"
                        type="button"
                        variant="ghost"
                    >
                        <Trash2 aria-hidden="true" className="size-4" focusable="false" />
                        <span className="font-medium text-xs">Clear Chat</span>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function MessageActions({ isMe, text }: { isMe: boolean, text: string }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    aria-label="Message actions"
                    className="size-7 rounded bg-background hover:bg-accent"
                    size="icon"
                    type="button"
                    variant="ghost"
                >
                    <MoreHorizontal
                        aria-hidden="true"
                        className="size-3.5"
                        focusable="false"
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="center"
                className="w-40 rounded-lg bg-popover p-1 shadow-xl"
            >
                <div className="flex flex-col gap-1">
                    <Button
                        aria-label="Copy"
                        className="w-full justify-start gap-2 rounded px-2 py-1 text-xs"
                        size="sm"
                        type="button"
                        variant="ghost"
                        onClick={handleCopy}
                    >
                        <Copy aria-hidden="true" className="size-3" focusable="false" />
                        <span>Copy</span>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function DocumentChat({ documentText }: DocumentChatProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        // Find the scroll viewport inside ScrollArea
        const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim() || loading) return

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMessage: Message = { role: 'user', content: input, timestamp: now }
        setMessages(prev => [...prev, userMessage])
        setInput("")
        setLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    documentText,
                    chatHistory: messages
                })
            })

            if (!response.ok) throw new Error('Chat failed')

            const data = await response.json()
            const assistantTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const assistantMessage: Message = { role: 'assistant', content: data.reply, timestamp: assistantTime }
            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            console.error('Chat error:', error)
            const errorTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: errorTime
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <Card className="h-full flex flex-col shadow-none border-0 bg-transparent">
            {/* Header */}
            <CardHeader className="sticky top-0 z-10 flex flex-row items-center justify-between gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 rounded-t-lg">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="border-2 border-blue-100">
                            <AvatarImage src="https://api.dicebear.com/9.x/bottts/svg?seed=AI" alt="AI Assistant" />
                            <AvatarFallback><Bot className="w-5 h-5" /></AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 block size-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                    </div>
                    <div className="flex flex-col">
                        <div className="font-semibold text-sm">AI Document Assistant</div>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <StatusBadge status="online" /> Online
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <UserActionsMenu />
                </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col bg-background/50">
                <ScrollArea
                    ref={scrollAreaRef}
                    className="flex-1 px-4"
                >
                    <div className="flex flex-col gap-6 py-4">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 py-12 flex flex-col items-center">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                    <Bot className="w-8 h-8 text-blue-500 opacity-80" />
                                </div>
                                <p className="text-sm font-medium text-gray-600">No messages yet</p>
                                <p className="text-xs text-gray-400 mt-1">Ask a question about your document to get started</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => {
                            const isMe = msg.role === 'user';
                            const renderMarkdown = (text: string) => {
                                // 1. Escape HTML entities to prevent XSS
                                let safeText = text
                                    .replace(/&/g, "&amp;")
                                    .replace(/</g, "&lt;")
                                    .replace(/>/g, "&gt;")
                                    .replace(/"/g, "&quot;")
                                    .replace(/'/g, "&#039;");

                                // 2. Apply Basic Markdown Formatting
                                let html = safeText
                                    // Bold
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    // Italic
                                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                    // Lists
                                    .replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>')
                                    .replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul class="list-disc pl-4 my-2">$1</ul>')
                                    // Newlines
                                    .replace(/\n/g, '<br />');
                                return html;
                            };

                            return (
                                <div
                                    className={cn(
                                        "group flex gap-2 w-full",
                                        isMe ? "justify-end" : "justify-start"
                                    )}
                                    key={idx}
                                >
                                    <div
                                        className={cn(
                                            "flex max-w-[85%] items-start gap-2",
                                            isMe ? "flex-row-reverse" : undefined
                                        )}
                                    >
                                        <Avatar className="size-8 mt-1">
                                            {isMe ? (
                                                <>
                                                    <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=User" />
                                                    <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                                </>
                                            ) : (
                                                <>
                                                    <AvatarImage src="https://api.dicebear.com/9.x/bottts/svg?seed=AI" />
                                                    <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                                                </>
                                            )}
                                        </Avatar>
                                        <div>
                                            <div
                                                className={cn(
                                                    "rounded-2xl px-4 py-2.5 text-xs shadow-sm",
                                                    isMe
                                                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                        : "bg-white border text-foreground rounded-tl-sm font-sans"
                                                )}
                                            >
                                                {!isMe ? (
                                                    <div
                                                        className="prose prose-sm max-w-none text-xs prose-p:my-1 prose-ul:my-1 prose-li:my-0.5"
                                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                                                    />
                                                ) : (
                                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                )}
                                            </div>
                                            <div className={cn(
                                                "mt-1 flex items-center gap-2",
                                                isMe ? "justify-end" : "justify-start"
                                            )}>
                                                <time className="text-[10px] text-muted-foreground font-medium opacity-70">
                                                    {msg.timestamp || 'Just now'}
                                                </time>
                                                <div className="opacity-0 transition-all group-hover:opacity-100 scale-90">
                                                    <MessageActions isMe={isMe} text={msg.content} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {loading && (
                            <div className="flex gap-2 justify-start w-full">
                                <div className="flex max-w-[85%] items-start gap-2">
                                    <Avatar className="size-8 mt-1">
                                        <AvatarImage src="https://api.dicebear.com/9.x/bottts/svg?seed=AI" />
                                        <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="bg-white border text-foreground rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-background border-t">
                    <div className="relative flex items-center">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            disabled={loading}
                            className="pr-12 py-3 rounded-full bg-muted/50 border-muted-foreground/20 focus-visible:ring-1 focus-visible:ring-primary/30 text-xs"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            size="icon"
                            className={cn(
                                "absolute right-1.5 h-9 w-9 rounded-full transition-all",
                                input.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted"
                            )}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 ml-0.5" />
                            )}
                        </Button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-muted-foreground">
                            AI can make mistakes. Check important info.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
