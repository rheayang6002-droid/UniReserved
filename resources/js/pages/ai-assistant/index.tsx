import { useState, useRef, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import {
    Sparkles,
    Send,
    Bot,
    User,
    RefreshCw,
    ShieldCheck,
    HelpCircle,
    Info,
    RotateCcw,
} from 'lucide-react';

type Message = {
    id: string;
    sender: 'student' | 'ai';
    text: string;
    timestamp: string;
};

type Props = {
    student_name: string;
    sample_questions: string[];
};

export default function AIAssistantIndex({
    student_name,
    sample_questions = [],
}: Props) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            sender: 'ai',
            text: `Hello ${student_name}! 👋\n\nI am your **UNiReserve AI Reservation Assistant**. I'm here to help you check your uniform reservation status, view your current queue position, check uniform stock availability, and guide you through the reservation and pickup steps.\n\nWhat would you like to know today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const sendMessage = async (textToSend?: string) => {
        const text = (textToSend || input).trim();
        if (!text || loading) return;

        const userMsg: Message = {
            id: `user-${Date.now()}`,
            sender: 'student',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, userMsg]);
        if (!textToSend) setInput('');
        setLoading(true);

        try {
            // Get CSRF token from document cookie or meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                || (document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ? decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)![1]) : '');

            const response = await fetch('/ai-assistant/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-XSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    message: text,
                    history: messages.slice(-6).map((m) => ({
                        sender: m.sender,
                        text: m.text,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error('Network error');
            }

            const data = await response.json();

            const aiMsg: Message = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: data.reply || "I'm sorry, I couldn't process your request right now. Please try again.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages((prev) => [...prev, aiMsg]);
        } catch (err) {
            const errorMsg: Message = {
                id: `ai-err-${Date.now()}`,
                sender: 'ai',
                text: "Sorry, the AI assistant is temporarily unavailable. Please use the reservation page or try again later.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                id: 'welcome',
                sender: 'ai',
                text: `Chat reset. Hello ${student_name}, how can I help you with your uniform reservation?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
        ]);
    };

    return (
        <>
            <Head title="AI Reservation Assistant — UNiReserve" />

            <div className="p-4 sm:p-6 max-w-4xl mx-auto h-[calc(100vh-5rem)] flex flex-col space-y-4">
                {/* Header */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-bold text-gray-900 text-base">UNiReserve AI Assistant</h1>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Factual & Privacy Verified
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">
                                Connected to your authenticated student profile ({student_name})
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={clearChat}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                        title="Reset conversation"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Chat
                    </button>
                </div>

                {/* Quick Suggestion Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
                    <span className="text-xs font-semibold text-gray-400 shrink-0 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Suggestions:
                    </span>
                    {sample_questions.map((q, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => sendMessage(q)}
                            disabled={loading}
                            className="px-3 py-1 bg-white hover:bg-blue-50 hover:border-blue-300 text-gray-700 hover:text-blue-700 text-xs font-medium rounded-full border border-gray-200 transition-all shrink-0 cursor-pointer shadow-2xs disabled:opacity-50"
                        >
                            {q}
                        </button>
                    ))}
                </div>

                {/* Chat Messages Container */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
                    {messages.map((msg) => {
                        const isStudent = msg.sender === 'student';

                        return (
                            <div
                                key={msg.id}
                                className={`flex items-start gap-3 ${isStudent ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                        isStudent
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-indigo-100 text-indigo-700'
                                    }`}
                                >
                                    {isStudent ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>

                                <div className={`max-w-[80%] sm:max-w-[70%] space-y-1`}>
                                    <div
                                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                                            isStudent
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-gray-50 text-gray-800 border border-gray-200/80 rounded-tl-none'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <div
                                        className={`text-[10px] text-gray-400 px-1 ${
                                            isStudent ? 'text-right' : 'text-left'
                                        }`}
                                    >
                                        {msg.timestamp}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {loading && (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl rounded-tl-none p-3.5 text-xs text-gray-500 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                                Querying verified database record...
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2 flex items-center gap-2 shrink-0">
                    <input
                        type="text"
                        placeholder="Ask about your reservation status, queue position, sizing, pickup rules..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        className="flex-1 px-4 py-2 text-xs sm:text-sm text-gray-900 bg-transparent border-none focus:outline-none placeholder:text-gray-400"
                    />

                    <button
                        type="button"
                        onClick={() => sendMessage()}
                        disabled={loading || !input.trim()}
                        className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                        title="Send message"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>

                {/* Privacy & Safety Disclaimer */}
                <div className="text-[11px] text-gray-400 text-center shrink-0 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                    The assistant only answers from your authenticated database record. Other students' information is strictly private.
                </div>
            </div>
        </>
    );
}
