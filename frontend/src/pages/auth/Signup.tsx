import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import {
    GraduationCap, Mail, Lock, User,
    ArrowLeft, Loader2, ShieldCheck,
    Sparkles, CheckCircle2
} from 'lucide-react';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const { signup, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signup(email, password, fullName);
            navigate('/dashboard');
        } catch (err) {
            // Error managed by store
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden glow-mesh">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                className="w-full max-w-[500px] relative z-10"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-3 transition-transform hover:scale-105">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20">
                            <GraduationCap className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <div className="text-left">
                            <span className="text-2xl font-black tracking-tighter block leading-none">UniGPT</span>
                            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground">Registry</span>
                        </div>
                    </Link>
                </div>

                <Card className="glass border-primary/10 shadow-2xl rounded-[3rem] overflow-hidden">
                    <CardHeader className="text-center pt-10 pb-6 px-10">
                        <CardTitle className="text-3xl font-black tracking-tighter mb-2">Create Identity</CardTitle>
                        <CardDescription className="text-sm font-medium">
                            Join the unified university intelligence network
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-10 pb-12">
                        {error && (
                            <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-destructive" />
                                <p className="text-[11px] font-bold uppercase tracking-wider text-destructive">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Legal Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            placeholder="Academic Name"
                                            className="h-14 pl-12 rounded-2xl border-border/50 bg-background/50 focus:bg-background transition-all"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Academic Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="email"
                                            placeholder="id@university.edu"
                                            className="h-14 pl-12 rounded-2xl border-border/50 bg-background/50 focus:bg-background transition-all"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Secure Passphrase</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="password"
                                            placeholder="Complex Security Sequence"
                                            className="h-14 pl-12 rounded-2xl border-border/50 bg-background/50 focus:bg-background transition-all"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 px-1">
                                {[
                                    "FERPA Compliant Infrastructure",
                                    "Role-Based Access Control",
                                    "Encrypted Document Indexing"
                                ].map((term) => (
                                    <div key={term} className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                        <CheckCircle2 className="w-3 h-3 text-primary/60" />
                                        <span className="uppercase tracking-widest">{term}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 text-[11px] font-black uppercase tracking-[0.2em] mt-2 font-bold"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Authorizing...
                                    </>
                                ) : (
                                    'Establish Identity'
                                )}
                            </Button>

                            <p className="text-center text-xs font-semibold text-muted-foreground">
                                Already have an identity?{' '}
                                <Link to="/auth/login" className="text-primary hover:underline font-black">
                                    Initial Session
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest hover:opacity-100 transition-opacity">Cloud Secured</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest hover:opacity-100 transition-opacity">Neural Processing</span>
                    </div>
                </div>

                <Link
                    to="/"
                    className="mt-10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
                    Back to Terminal
                </Link>
            </motion.div>
        </div>
    );
}
