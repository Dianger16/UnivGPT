import React from 'react';
import { motion } from 'framer-motion';
import {
    Search, FileText, MessageSquare, Clock,
    TrendingUp, Shield, HelpCircle, ArrowRight,
    Brain, Sparkles, Database, Globe, Zap,
    Cpu, Layers, Bookmark, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const stats = [
        { label: 'Neural Queries', value: '124', icon: MessageSquare, color: 'text-violet-500', bg: 'bg-violet-500/10' },
        { label: 'Corpus Indexed', value: '14.2k', icon: Database, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Accuracy', value: '99.2%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Latency', value: '142ms', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    const recentQueries = [
        { query: "Refund policy for Fall 2024", time: "2h ago", category: "FINANCE" },
        { query: "How to apply for campus research?", time: "5h ago", category: "ACADEMIC" },
        { query: "Library late fee structure", time: "1d ago", category: "LOGISTICS" },
    ];

    return (
        <div className="space-y-12 pb-20">
            {/* Elegant Welcome Hero */}
            <div className="relative overflow-hidden rounded-[3rem] border border-primary/10 bg-card/40 backdrop-blur-xl p-12 md:p-16 group">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />

                <div className="relative z-10 max-w-4xl space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3"
                    >
                        <Badge variant="premium" className="px-4 py-1">v4.2 Neural Node</Badge>
                        <div className="h-1 w-1 rounded-full bg-border" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Encryption Active</span>
                    </motion.div>

                    <div className="space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-5xl md:text-7xl font-black tracking-tighter leading-none uppercase"
                        >
                            Your <span className="text-primary italic">Intelligence</span> <br /> Command Hub.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-muted-foreground font-semibold leading-relaxed max-w-2xl"
                        >
                            Direct access to the university knowledge corpus via proprietary neural retrieval.
                            Get precise answers from thousands of verified documents instantly.
                        </motion.p>
                    </div>

                    <div className="flex flex-wrap gap-5 pt-4">
                        <Link to="/dashboard/chat">
                            <Button size="lg" className="rounded-2xl h-14 px-10 bg-primary hover:bg-primary/90 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 group">
                                Initialize Query
                                <Sparkles className="ml-3 w-4 h-4 transition-transform group-hover:rotate-12 group-hover:scale-110" />
                            </Button>
                        </Link>
                        <Link to="/dashboard/documents">
                            <Button size="lg" variant="outline" className="rounded-2xl h-14 px-10 border-primary/20 text-[11px] font-black uppercase tracking-[0.2em] glass hover:border-primary/40">
                                Explore Corpus
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Core Stats Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="glass border-primary/5 overflow-hidden card-hover group cursor-default">
                            <CardContent className="p-8">
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3", stat.bg)}>
                                    <stat.icon className={cn("w-7 h-7", stat.color)} />
                                </div>
                                <div className="text-3xl font-black tracking-tighter mb-1">{stat.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{stat.label}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                {/* Intelligence Stream */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Layers className="w-5 h-5 text-primary" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Stream</h2>
                        </div>
                        <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary rounded-xl">
                            History Index <ArrowRight className="ml-2 w-3.5 h-3.5" />
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {recentQueries.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + (i * 0.1) }}
                                className="group glass border-transparent hover:border-primary/20 p-6 rounded-[2rem] flex items-center justify-between transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="h-14 w-14 rounded-2xl bg-muted/50 border flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                                        <Brain className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-all group-hover:scale-110" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <Badge className="bg-muted text-[8px] tracking-normal font-bold rounded-md h-4 px-1.5">{item.category}</Badge>
                                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{item.time}</span>
                                        </div>
                                        <div className="text-base font-bold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors">{item.query}</div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all relative z-10">
                                    <ArrowRight className="w-5 h-5 text-primary" />
                                </div>
                                {/* Subtle background fill on hover */}
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors" />
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid sm:grid-cols-2 gap-6 pt-4">
                        <Card className="glass border-primary/5 rounded-[2.5rem] p-8 card-hover cursor-pointer group">
                            <Bookmark className="w-8 h-8 text-violet-500 mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-black tracking-tighter mb-2">Saved Insights</h3>
                            <p className="text-xs font-semibold text-muted-foreground leading-relaxed italic">Access your bookmarked neural responses and source citations.</p>
                        </Card>
                        <Card className="glass border-primary/5 rounded-[2.5rem] p-8 card-hover cursor-pointer group">
                            <Star className="w-8 h-8 text-amber-500 mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-black tracking-tighter mb-2">Academic Roadmap</h3>
                            <p className="text-xs font-semibold text-muted-foreground leading-relaxed italic">AI-generated course recommendations based on campus data.</p>
                        </Card>
                    </div>
                </div>

                {/* Sidebar Utilities */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="space-y-6">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary px-2">Knowledge Pulse</h2>

                        <Card className="bg-primary border-transparent text-primary-foreground shadow-2xl shadow-primary/30 rounded-[2.5rem] overflow-hidden relative group">
                            {/* Decorative graphics */}
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Cpu className="w-20 h-20" />
                            </div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

                            <CardHeader className="p-10 pb-4 relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Optimization Level 5</span>
                                </div>
                                <CardTitle className="text-3xl font-black tracking-tighter mb-2">Deep Narrative Search</CardTitle>
                            </CardHeader>
                            <CardContent className="px-10 pb-10 space-y-8 relative z-10">
                                <p className="text-[13px] font-semibold leading-relaxed text-white/90">
                                    Our engine understands intent. Instead of keywords, type full scenarios like
                                    <span className="italic block mt-3 p-3 bg-white/10 rounded-xl border border-white/10">"I missed the research deadline because of a medical emergency, what are my options?"</span>
                                </p>
                                <Button className="w-full rounded-2xl bg-white text-primary hover:bg-white/90 font-black text-[10px] uppercase tracking-widest h-14 shadow-xl shadow-primary/10">
                                    View Protocol Docs
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="glass border-primary/10 rounded-[2.5rem] p-10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <Shield className="w-16 h-16" />
                        </div>
                        <div className="flex items-center gap-5 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-widest">Privacy Matrix</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Active & Shielded</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold italic">
                            Identified as Authorized Student Node. All queries are anonymized via double-blind vector masking and processed using end-to-end TLS 1.3 encryption.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
