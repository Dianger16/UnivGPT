import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, FileText, Settings, LogOut,
    Menu, X, Bell, Search, User, ChevronRight,
    Sparkles, GraduationCap, Shield, Activity,
    Zap, Cpu, Globe, Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();

    const role = user?.role || 'student';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Correcting icons based on earlier use or typical patterns
    const MessageSquare = Sparkles; // Fallback or imported
    const Layers = Cpu;
    const Database = Globe;
    const TrendingUp = Activity;

    const navigation = {
        student: [
            { name: 'Research Hub', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Neural Chat', href: '/dashboard/chat', icon: MessageSquare },
            { name: 'My Corpus', href: '/dashboard/courses', icon: Layers },
            { name: 'System Info', href: '/dashboard/settings', icon: Activity },
        ],
        faculty: [
            { name: 'Workspace', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Knowledge Hub', href: '/dashboard/documents', icon: Database },
            { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
            { name: 'Settings', href: '/dashboard/settings', icon: Settings },
        ],
        admin: [
            { name: 'Command Center', href: '/dashboard', icon: Command },
            { name: 'Policy Corpus', href: '/dashboard/documents', icon: Shield },
            { name: 'Node Directory', href: '/dashboard/users', icon: User },
            { name: 'Audit Logs', href: '/dashboard/audit', icon: Activity },
        ],
    };

    const currentNav = navigation[role as keyof typeof navigation] || navigation.student;

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden glow-mesh">
            {/* Elegant Sidebar */}
            <aside
                className={cn(
                    "relative z-50 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-r border-primary/5 bg-card/20 backdrop-blur-2xl shrink-0 group/sidebar",
                    isSidebarOpen ? "w-80" : "w-24"
                )}
            >
                {/* Visual accents */}
                <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                <div className="h-24 flex items-center px-7 shrink-0 relative">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-primary/30 shrink-0 transition-transform hover:rotate-6">
                            <GraduationCap className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex flex-col"
                                >
                                    <span className="text-xl font-black tracking-tighter leading-none mb-1">UniGPT</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] uppercase tracking-[0.4em] font-black text-primary/70">{role} NODE</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {currentNav.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "group flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-500 relative overflow-hidden",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20"
                                        : "text-muted-foreground/70 hover:text-foreground hover:bg-primary/5"
                                )}
                            >
                                <item.icon className={cn("w-6 h-6 shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3", isActive && "text-primary-foreground")} />
                                <AnimatePresence>
                                    {isSidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-[11px] font-black uppercase tracking-[0.2em] relative z-10"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {isActive && isSidebarOpen && (
                                    <motion.div
                                        layoutId="sidebar-chevron"
                                        className="absolute right-5"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5 text-primary-foreground/50" />
                                    </motion.div>
                                )}

                                {/* Hover background effect */}
                                {!isActive && (
                                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-[0.03] transition-opacity" />
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-primary/5 shrink-0 relative bg-muted/20">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "group flex items-center gap-4 px-5 py-5 rounded-[1.5rem] text-muted-foreground hover:text-destructive transition-all duration-300 w-full relative overflow-hidden",
                        )}
                    >
                        <LogOut className="w-6 h-6 shrink-0 transition-transform group-hover:-translate-x-1" />
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[11px] font-black uppercase tracking-[0.2em] relative z-10"
                                >
                                    Terminate Session
                                </motion.span>
                            )}
                        </AnimatePresence>
                        <div className="absolute inset-0 bg-destructive opacity-0 group-hover:opacity-[0.05] transition-opacity" />
                    </button>

                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-5 rounded-[2rem] bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 relative overflow-hidden group/card"
                            >
                                <div className="flex items-center gap-3 mb-4 relative z-10">
                                    <div className="w-9 h-9 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 group-hover/card:scale-110 transition-transform">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">System Health</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden relative z-10">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "88%" }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                                <div className="mt-3 flex justify-between items-center relative z-10">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Encryption Level</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Tier 4</span>
                                </div>
                                {/* Subtle grain texture overlay if needed, or just light */}
                                <div className="absolute top-0 right-0 p-2 opacity-5">
                                    <Zap className="w-10 h-10" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Sophisticated Header */}
                <header
                    className={cn(
                        "h-24 flex items-center justify-between px-10 shrink-0 relative z-30 transition-all duration-500",
                        scrolled ? "bg-background/80 backdrop-blur-2xl border-b border-primary/5 py-4" : "bg-transparent py-6"
                    )}
                >
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="w-12 h-12 flex items-center justify-center hover:bg-muted/50 rounded-2xl transition-all border border-transparent hover:border-primary/5 text-muted-foreground hover:text-primary"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        <div className="relative hidden lg:block group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all group-focus-within:scale-110" />
                            <input
                                type="text"
                                placeholder="Universal Index Search..."
                                className="h-14 w-[400px] pl-14 pr-6 rounded-[1.5rem] border border-primary/5 bg-muted/30 focus:bg-background focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all text-[11px] font-bold uppercase tracking-widest placeholder:text-muted-foreground/30 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <button className="relative w-12 h-12 flex items-center justify-center hover:bg-muted/50 rounded-2xl transition-all group">
                                <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse" />
                            </button>
                            <button className="relative w-12 h-12 flex items-center justify-center hover:bg-muted/50 rounded-2xl transition-all group">
                                <Globe className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                        </div>

                        <div className="h-10 w-[1px] bg-primary/10" />

                        <div className="flex items-center gap-4 pl-2 group cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <div className="text-[12px] font-black uppercase tracking-tighter leading-none mb-1 group-hover:text-primary transition-colors">{user?.full_name || 'System Identity'}</div>
                                <div className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/60">{user?.department || 'CORE HUB'}</div>
                            </div>
                            <div className="relative">
                                <div className="w-13 h-13 rounded-3xl bg-card border-2 border-primary/10 flex items-center justify-center shadow-2xl transition-all group-hover:scale-110 group-hover:-rotate-3 overflow-hidden">
                                    <User className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background shadow-lg shadow-emerald-500/20" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-transparent px-10 pb-10 pt-4 custom-scrollbar relative z-20">
                    <div className="max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>

                {/* Background ambient lighting */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
                    <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[150px]" />
                </div>
            </div>
        </div>
    );
}
