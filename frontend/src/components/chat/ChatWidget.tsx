import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useChatStore, type ChatMessage } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import {
    Send, Loader2, MessageSquare, ChevronDown, ChevronUp,
    FileText, Bot, User, Sparkles, Plus, Terminal, RefreshCcw, Search, ExternalLink, Shield,
    Brain, Cpu, Zap
} from 'lucide-react';
import type { SourceCitation } from '@/lib/api';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function SourceCard({ source }: { source: SourceCitation }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border border-primary/10 rounded-2xl p-4 text-[10px] bg-card/40 backdrop-blur-md hover:border-primary/30 transition-all card-hover group">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-3 w-full text-left font-black uppercase tracking-widest"
            >
                <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                </div>
                <span className="truncate flex-1 text-[11px]">{source.title}</span>
                <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center transition-transform group-hover:scale-110">
                    {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-4 border-t border-dashed border-primary/10">
                            <p className="text-muted-foreground leading-relaxed font-semibold italic text-[11px]">"{source.snippet}"</p>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="text-[9px] bg-muted/50 px-2 py-1 rounded-lg uppercase font-black text-muted-foreground border border-border/50">
                                    REF: {source.document_id.slice(0, 8)}
                                </span>

                                {source.metadata && Object.entries(source.metadata).map(([key, value]) => {
                                    if (key === 'department' || key === 'course' || !value) return null;
                                    const isImportant = key.includes('date') || key.includes('deadline');

                                    return (
                                        <span key={key} className={cn(
                                            "text-[9px] px-2 py-1 rounded-lg uppercase font-black border",
                                            isImportant
                                                ? "bg-primary/10 text-primary border-primary/20"
                                                : "bg-muted/50 text-muted-foreground border-border/50"
                                        )}>
                                            {key.replace('_', ' ')}: {String(value)}
                                        </span>
                                    );
                                })}
                                <a
                                    href={`/dashboard/documents?id=${source.document_id}`}
                                    className="ml-auto text-[9px] flex items-center gap-1.5 font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
                                >
                                    Access Original <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';

    return (
        <motion.div
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-10`}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
            <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'} space-y-4`}>
                {!isUser && (
                    <div className="flex items-center gap-3 mb-2 px-1">
                        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Bot className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Neural Agent</span>
                            <span className="text-[8px] font-bold text-primary uppercase tracking-[0.3em]">Quantum Pipeline</span>
                        </div>
                        {message.roleBadge && (
                            <Badge className="h-5 px-2 py-0 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20 rounded-lg">
                                {message.roleBadge}
                            </Badge>
                        )}
                    </div>
                )}

                <div
                    className={cn(
                        "rounded-[2rem] px-8 py-6 text-[15px] leading-relaxed relative",
                        isUser
                            ? "bg-primary text-primary-foreground font-semibold shadow-2xl shadow-primary/20 rounded-tr-none"
                            : "glass border-primary/10 shadow-xl rounded-tl-none"
                    )}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="prose prose-zinc dark:prose-invert prose-p:leading-relaxed prose-a:text-primary 
                            prose-headings:font-black prose-headings:tracking-tighter
                            prose-tr:border-b prose-tr:border-primary/5 prose-th:bg-primary/5 prose-th:uppercase prose-th:text-[10px] prose-th:tracking-[0.2em] prose-th:py-3 prose-th:px-4 prose-td:px-4">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}

                    {/* Subtle corner glow for AI messages */}
                    {!isUser && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                    )}
                </div>

                {/* Source citations */}
                {!isUser && message.sources && message.sources.length > 0 && (
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center gap-4 px-2">
                            <div className="h-[1px] w-8 bg-primary/20" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                <Search className="w-3.5 h-3.5" /> Intelligence Corpus ({message.sources.length} nodes)
                            </p>
                            <div className="h-[1px] flex-1 bg-primary/10" />
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {message.sources.map((source, i) => (
                                <SourceCard key={i} source={source} />
                            ))}
                        </div>
                    </div>
                )}

                {message.rationale && (
                    <div className="flex items-center gap-2 px-3 mt-4">
                        <Cpu className="w-3 h-3 text-muted-foreground opacity-50" />
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Process Node: {message.rationale}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

interface ChatWidgetProps {
    className?: string;
    fullHeight?: boolean;
}

export default function ChatWidget({ className = '', fullHeight = false }: ChatWidgetProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { messages, isQuerying, sendQuery, newConversation } = useChatStore();
    const { token } = useAuthStore();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !token || isQuerying) return;
        const query = input;
        setInput('');
        await sendQuery(token, query);
    };

    return (
        <div className={cn(
            "flex flex-col bg-card/10 backdrop-blur-3xl overflow-hidden transition-all relative border border-primary/10",
            fullHeight ? 'h-full rounded-none border-x-0 border-t-0' : 'h-[800px] rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)]',
            className
        )}>
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-primary/10 bg-background/20 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Brain className="w-6 h-6 text-primary" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-background animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
                            Neural Interaction <span className="text-[10px] text-muted-foreground font-black lowercase italic opacity-40 px-2 py-0.5 rounded-full border border-border/50">v4.0.2</span>
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mt-0.5">Vector Tunnel Established</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-full px-5 border-primary/10 hover:bg-primary/5 text-[10px] font-black uppercase tracking-widest gap-2"
                        onClick={newConversation}
                    >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        Flush Context
                    </Button>
                </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-none custom-scrollbar relative z-10">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto space-y-12">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-24 h-24 bg-primary/5 border border-primary/10 flex items-center justify-center rounded-[2.5rem] shadow-2xl relative"
                        >
                            <Bot className="w-12 h-12 text-primary" />
                            <div className="absolute -inset-4 bg-primary/20 rounded-[3rem] blur-2xl -z-10 opacity-30" />
                        </motion.div>

                        <div className="space-y-4">
                            <h3 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Neural Core <br /> <span className="text-primary italic">Awaiting Request</span></h3>
                            <p className="text-sm text-muted-foreground font-semibold leading-relaxed max-w-sm mx-auto">
                                Query the university database. Our agents utilize semantic routing to provide verified answers with high precision.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center">
                            {[
                                "Semester Withdrawal Policy",
                                "Post-Grad Research Portal",
                                "Faculty Board Deadlines",
                                "Academic Scholarship Data"
                            ].map((suggestion, i) => (
                                <motion.button
                                    key={suggestion}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => setInput(suggestion)}
                                    className="px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20 bg-primary/5 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all shadow-xl shadow-primary/5"
                                >
                                    {suggestion}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto w-full">
                        {messages.map((msg, i) => (
                            <MessageBubble key={i} message={msg} />
                        ))}
                        {isQuerying && (
                            <motion.div
                                className="flex justify-start mb-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="space-y-4 w-full max-w-[70%]">
                                    <div className="flex items-center gap-3 mb-2 px-1">
                                        <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center">
                                            <Zap className="w-5 h-5 text-primary animate-pulse" />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] animate-pulse">Analyzing Corpus Nodes...</span>
                                    </div>
                                    <div className="h-24 glass rounded-[2rem] border-dashed border-primary/20 animate-pulse w-full relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Console */}
            <div className="p-8 border-t border-primary/10 bg-background/40 backdrop-blur-2xl relative z-20">
                <form onSubmit={handleSend} className="relative max-w-4xl mx-auto group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-30 transition-opacity" />

                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="EX: ANALYZE SCHOLARSHIP_ELIGIBILITY_MATRIX..."
                        className="h-20 pl-10 pr-20 bg-background/60 border-2 border-primary/5 focus:border-primary/40 font-bold tracking-tight text-lg transition-all rounded-[1.8rem] shadow-2xl relative z-10 placeholder:text-muted-foreground/30"
                        disabled={isQuerying}
                    />

                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-3">
                        <Button
                            type="submit"
                            size="icon"
                            className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                            disabled={!input.trim() || isQuerying}
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </form>

                <div className="flex items-center justify-center gap-8 mt-6 opacity-30">
                    {[
                        { icon: Shield, label: "AES-256 Vector Encryption" },
                        { icon: Cpu, label: "Quantum Semantic Routing" }
                    ].map((badge) => (
                        <div key={badge.label} className="flex items-center gap-2">
                            <badge.icon className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">{badge.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
