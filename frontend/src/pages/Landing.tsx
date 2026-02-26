import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    GraduationCap, ArrowRight, Shield, Zap, Search,
    FileText, Check, Globe, Layout, Menu, X,
    Home, Info, Laptop, Sparkles, Brain, Lock, Cloud, Workflow,
    ArrowUpRight, Play, Cpu, Database
} from 'lucide-react';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { cn } from '@/lib/utils';

const Landing = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const bentoFeatures = [
        {
            icon: Brain,
            title: "Cognitive Document Analysis",
            description: "Go beyond keyword matching. Our AI understands the semantic meaning of your university documents.",
            className: "col-span-2 row-span-2 bg-primary/5 border-primary/20",
            iconColor: "text-violet-500"
        },
        {
            icon: Shield,
            title: "FERPA Compliant",
            description: "Student data privacy is our top priority.",
            className: "col-span-1 row-span-1 border-muted",
            iconColor: "text-blue-500"
        },
        {
            icon: Zap,
            title: "Real-time Sync",
            description: "Documents are processed and searchable in seconds.",
            className: "col-span-1 row-span-1 border-muted",
            iconColor: "text-amber-500"
        },
        {
            icon: Workflow,
            title: "Cross-Department Intelligence",
            description: "Connect silos. Get answers that span across departments, from Academics to Financial Aid.",
            className: "col-span-2 row-span-1 bg-muted/30 border-muted",
            iconColor: "text-emerald-500"
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 glow-mesh">
            {/* Header / Navbar */}
            <header
                className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'h-16 py-0 glass border-b' : 'h-24 py-4 bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20 transition-transform group-hover:rotate-12">
                            <GraduationCap className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tighter leading-none">UniGPT</span>
                            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground">Intelligence</span>
                        </div>
                    </Link>

                    {/* Desktop Menu - Center floating by NavBar component */}
                    <div className="hidden lg:block">
                        <NavBar items={[
                            { name: 'Home', url: '#', icon: Home },
                            { name: 'Features', url: '#features', icon: Info },
                            { name: 'Platform', url: '#platform', icon: Laptop }
                        ]} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/auth/login" className="hidden sm:block text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                            Sign In
                        </Link>
                        <Link to="/auth/signup">
                            <Button size="sm" className="rounded-full px-6 bg-primary hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest h-10 shadow-xl shadow-primary/20">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative">
                {/* Hero Section */}
                <section className="relative pt-40 pb-20 px-6 min-h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_50%_40%,hsla(262,83%,58%,0.15),transparent_70%)] pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="mb-6"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            Next-Gen Campus Intelligence
                        </div>
                    </motion.div>

                    <motion.h1
                        className="text-6xl md:text-9xl font-black leading-[0.8] tracking-tighter mb-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        Unified <br /> <span className="text-primary italic">Intelligence.</span>
                    </motion.h1>

                    <motion.p
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        UniGPT processes your university's complex documentation into a secure,
                        instant, and conversational knowledge base for everyone on campus.
                    </motion.p>

                    <motion.div
                        className="flex flex-wrap justify-center gap-4"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        <Link to="/auth/signup">
                            <Button size="xl" className="rounded-full px-10 group bg-primary h-14 text-sm font-bold shadow-2xl shadow-primary/30">
                                Start Deployment
                                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                        <Button variant="outline" size="xl" className="rounded-full px-10 h-14 text-sm font-bold border-muted-foreground/20 glass">
                            <Play className="mr-2 w-4 h-4 fill-current" />
                            Watch Demo
                        </Button>
                    </motion.div>

                    {/* Floating Tech Badges */}
                    <div className="absolute left-1/2 -bottom-20 -translate-x-1/2 w-full max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-6 opacity-30 md:opacity-100 pointer-events-none">
                        {[
                            { icon: Cpu, label: "GPU Accelerated" },
                            { icon: Database, label: "Vector Indexing" },
                            { icon: Lock, label: "End-to-End Encrypted" },
                            { icon: Cloud, label: "SLA Guaranteed" }
                        ].map((item, i) => (
                            <motion.div
                                key={item.label}
                                className="flex items-center gap-3 p-4 glass rounded-2xl border"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 + (i * 0.1) }}
                            >
                                <item.icon className="w-5 h-5 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Features Bento Grid */}
                <section id="features" className="relative py-40 px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="mb-20 space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-primary">Core Systems</h2>
                            <h3 className="text-4xl md:text-6xl font-black tracking-tighter">Everything you need to <br /> digitize campus knowledge.</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {bentoFeatures.map((feature, i) => (
                                <motion.div
                                    key={feature.title}
                                    className={cn(
                                        "p-8 rounded-[2rem] border transition-all card-hover glass",
                                        feature.className
                                    )}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className={cn("w-12 h-12 flex items-center justify-center rounded-xl bg-background border mb-6", feature.iconColor)}>
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h4>
                                    <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Workflow Section */}
                <section id="platform" className="py-40 border-y bg-muted/20 relative overflow-hidden px-6">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">Seamless integration.</h2>
                                <p className="text-xl text-muted-foreground font-medium">Deployment takes minutes, not months. We've optimized every step of the AI ingestion pipeline.</p>
                            </div>

                            <div className="space-y-8">
                                {[
                                    { step: "01", title: "Source Connection", desc: "Connect your LMS, Cloud Storage, or upload PDF/DOCX manually." },
                                    { step: "02", title: "Semantic Shredding", desc: "Our models break documents into intelligent, context-aware chunks." },
                                    { step: "03", title: "Vector Hydration", desc: "Data is embedded into high-dimensional space for instant semantic search." },
                                    { step: "04", title: "Agent Deployment", desc: "Your campus AI is ready to serve students and faculty 24/7." }
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-6 group">
                                        <span className="text-3xl font-black text-primary/20 transition-colors group-hover:text-primary leading-none">{item.step}</span>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-bold tracking-tight">{item.title}</h4>
                                            <p className="text-muted-foreground text-sm font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-blue-500/30 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative glass border-border shadow-2xl rounded-[2.5rem] overflow-hidden aspect-[4/5] md:aspect-square flex items-center justify-center p-12">
                                <div className="w-full space-y-6">
                                    {[1, 2, 3].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="h-20 glass border-white/5 rounded-2xl flex items-center px-6 gap-4"
                                            initial={{ x: -20, opacity: 0 }}
                                            whileInView={{ x: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.2 }}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <FileText className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-2 w-1/3 bg-foreground/20 rounded" />
                                                <div className="h-2 w-full bg-foreground/5 rounded" />
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-muted-foreground/30" />
                                        </motion.div>
                                    ))}
                                    <div className="h-[2px] w-full bg-primary/20 relative">
                                        <motion.div
                                            className="absolute inset-0 bg-primary"
                                            initial={{ scaleX: 0 }}
                                            whileInView={{ scaleX: 1 }}
                                            transition={{ duration: 1.5 }}
                                        />
                                    </div>
                                    <motion.div
                                        className="h-32 glass border-primary/20 rounded-2xl flex items-center justify-center flex-col gap-2"
                                        initial={{ y: 20, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                    >
                                        <Brain className="w-8 h-8 text-primary animate-bounce" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Processing Knowledge</span>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-40 px-6">
                    <div className="max-w-4xl mx-auto glass rounded-[3rem] p-12 md:p-24 text-center space-y-8 relative overflow-hidden border-primary/20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9]">Ready to empower <br /> your campus?</h2>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">Join leading institutions using UniGPT to modernize their knowledge infrastructure.</p>
                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <Link to="/auth/signup">
                                <Button size="lg" className="rounded-full px-12 h-14 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20">
                                    Instant Registration
                                </Button>
                            </Link>
                            <Button size="lg" variant="outline" className="rounded-full px-12 h-14 font-black uppercase tracking-widest text-[11px] glass border-muted">
                                Schedule Briefing
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t py-20 px-6 glass">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
                    <div className="col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-foreground flex items-center justify-center rounded-lg">
                                <GraduationCap className="w-5 h-5 text-background" />
                            </div>
                            <span className="text-xl font-bold tracking-tighter">UniGPT</span>
                        </div>
                        <p className="text-muted-foreground text-sm max-w-[300px] leading-relaxed font-medium">
                            Providing students, faculty, and administrators with a high-bandwidth connection to campus knowledge.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Infrastucture</h5>
                        <ul className="space-y-3 text-sm font-bold text-foreground/70">
                            <li><a href="#" className="hover:text-primary transition-colors">Vector Search</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy Shield</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">RAG Pipeline</a></li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Connect</h5>
                        <ul className="space-y-3 text-sm font-bold text-foreground/70">
                            <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Support Portal</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact Dept</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-10 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">© 2026 UNIGPT TECHNOLOGIES INC. BUILT FOR ACADEMIC EXCELLENCE.</p>
                    <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <a href="#" className="hover:text-foreground">Privacy</a>
                        <a href="#" className="hover:text-foreground">Terms</a>
                        <a href="#" className="hover:text-foreground">SLA</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
