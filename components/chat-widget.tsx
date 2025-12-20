"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MessageCircle, X, Send, Minus } from "lucide-react"
import { useSession } from "@/hooks/use-session"

interface Message {
    id: string
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
}

// Generate unique session ID
const generateSessionId = () => {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi there! 👋 How can I help you with OCR or our tools today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ])
    const [inputValue, setInputValue] = useState("")
    const [sessionId, setSessionId] = useState<string>("")
    const [hasUserSentMessage, setHasUserSentMessage] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
    const { session } = useSession()

    // Initialize session ID
    useEffect(() => {
        let storedSession = localStorage.getItem('chatSessionId')
        if (!storedSession) {
            storedSession = generateSessionId()
            localStorage.setItem('chatSessionId', storedSession)
        }
        setSessionId(storedSession)
    }, [])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const chatContainerRef = useRef<HTMLDivElement>(null)

    // Reset inactivity timer
    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current)
        }
        // 5 minutes inactivity trigger
        inactivityTimerRef.current = setTimeout(() => {
            if (hasUserSentMessage) {
                endConversation()
            }
        }, 5 * 60 * 1000)
    }, [hasUserSentMessage])

    // End conversation - send summary email
    const endConversation = async () => {
        if (!hasUserSentMessage || !sessionId) return

        try {
            await fetch('/api/chat/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    userEmail: session?.email || null
                })
            })

            // Reset for new conversation
            const newSessionId = generateSessionId()
            localStorage.setItem('chatSessionId', newSessionId)
            setSessionId(newSessionId)
            setHasUserSentMessage(false)
            setMessages([{
                id: '1',
                text: "Hi there! 👋 How can I help you with OCR or our tools today?",
                sender: 'bot',
                timestamp: new Date()
            }])
        } catch (error) {
            console.error('Failed to end conversation:', error)
        }
    }

    // Handle close
    const handleClose = () => {
        setIsOpen(false)
        if (hasUserSentMessage) {
            endConversation()
        }
    }

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (chatContainerRef.current && !chatContainerRef.current.contains(event.target as Node) && isOpen) {
                handleClose()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen, hasUserSentMessage])

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current)
            }
        }
    }, [])

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !sessionId) return

        const newUserMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, newUserMessage])
        setInputValue("")
        setHasUserSentMessage(true)
        resetInactivityTimer()

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: newUserMessage.text,
                    sessionId,
                    documentText: (() => {
                        const stored = sessionStorage.getItem('ocr_result');
                        if (!stored) return "No document text available yet.";
                        try {
                            const parsed = JSON.parse(stored);
                            return parsed.pages ? parsed.pages.map((p: any) => p.text).join('\n\n') : (parsed.text || stored);
                        } catch {
                            return stored;
                        }
                    })(),
                    chatHistory: messages.map(m => ({
                        role: m.sender === 'user' ? 'user' : 'assistant',
                        content: m.text
                    }))
                })
            });

            const data = await response.json();

            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: data.reply || "I'm having trouble connecting right now.",
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botResponse])
            resetInactivityTimer()
        } catch (error) {
            console.error(error);
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I encountered an error. Please try again.",
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botResponse])
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // Only show chat widget for logged-in users
    if (!session) {
        return null
    }

    return (
        <div ref={chatContainerRef} className="fixed bottom-6 right-6 z-[50] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] md:w-[380px] h-[500px] bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
                    {/* Header */}
                    <div className="bg-red-600 p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="font-semibold">Infy Galaxy Support</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleClose}
                                className="hover:bg-red-700 p-1 rounded-full transition-colors"
                            >
                                <Minus size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
                        {messages.map((msg) => {
                            const renderMarkdown = (text: string) => {
                                // Basic regex markdown parser
                                let html = text
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
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                                            ? 'bg-red-600 text-white rounded-tr-none'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none font-sans'
                                            }`}
                                    >
                                        {msg.sender === 'bot' ? (
                                            <div
                                                className="prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                                            />
                                        ) : (
                                            msg.text
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim()}
                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-lg transition-all duration-300 ${isOpen
                    ? 'bg-gray-100 text-gray-600 rotate-90 scale-90'
                    : 'bg-red-600 text-white hover:bg-red-700 hover:scale-105'
                    }`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
            </button>
        </div>
    )
}
