import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { GraduationCap, Mail, Lock, Loader2, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * Dummy Credentials:
 * Admin: admin@unigpt.edu / admin-password-123
 * Faculty: faculty@unigpt.edu / faculty-password-123
 * Student: student@unigpt.edu / student-password-123
 */
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            // Error managed by store
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden glow-mesh">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                className="w-full max-w-[460px] relative z-10"
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
                            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground">Workspace</span>
                        </div>
                    </Link>
                </div>

                <Card className="glass border-primary/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="text-center pt-10 pb-6">
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <CardTitle className="text-3xl font-black tracking-tighter mb-2">Welcome Back</CardTitle>
                            <CardDescription className="text-sm font-medium">
                                Secure access to your university intelligence
                            </CardDescription>
                        </motion.div>
                    </CardHeader>
                    <CardContent className="px-10 pb-12">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3"
                            >
                                <div className="w-2 h-2 rounded-full bg-destructive" />
                                <p className="text-[11px] font-bold uppercase tracking-wider text-destructive">
                                    {error}
                                </p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Identity</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                        <Input
                                            type="email"
                                            placeholder="you@university.edu"
                                            className="h-14 pl-12 rounded-2xl border-border/50 bg-background/50 focus:bg-background transition-all"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Passphrase</label>
                                        <Link to="/auth/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                                            Recover?
                                        </Link>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••••••"
                                            className="h-14 pl-12 rounded-2xl border-border/50 bg-background/50 focus:bg-background transition-all"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 text-[11px] font-black uppercase tracking-[0.2em]"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    'Initialize Session'
                                )}
                            </Button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-card px-4 text-muted-foreground">Secure Portal</span></div>
                            </div>

                            <div className="text-center space-y-4">
                                <p className="text-xs font-semibold text-muted-foreground">
                                    New to the network?{' '}
                                    <Link to="/auth/signup" className="text-primary hover:underline font-black">
                                        Register Device
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest hover:opacity-100 transition-opacity">SSO Protected</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest hover:opacity-100 transition-opacity">AI Integrated</span>
                    </div>
                </div>

                <Link
                    to="/"
                    className="mt-12 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
                    Back to Main Portal
                </Link>
            </motion.div>
        </div>
    );
}
