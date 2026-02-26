import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ChatWidget from '@/components/chat/ChatWidget';
import { useAuthStore } from '@/store/authStore';
import { documentsApi, type DocumentResponse } from '@/lib/api';
import {
    Upload, FileText, BookOpen, Search, Loader2,
    FolderOpen, BarChart3, GraduationCap, ChevronRight,
    ArrowUpRight, Plus, Database, Sparkles, Brain,
    Layers, PenTool, Link as LinkIcon, Lock,
    CheckCircle2, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FacultyDashboard() {
    const { user, token } = useAuthStore();
    const [documents, setDocuments] = useState<DocumentResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (token) fetchDocuments();
    }, [token]);

    const fetchDocuments = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await documentsApi.list(token, { doc_type: 'faculty' });
            setDocuments(res.documents);
        } catch (err) {
            console.error('Failed to load documents:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('doc_type', 'faculty');
            formData.append('department', user?.department || 'General');
            formData.append('course', 'General');
            formData.append('tags', JSON.stringify(['faculty-upload']));
            await documentsApi.upload(token, formData);
            fetchDocuments();
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const filteredDocs = documents.filter(d =>
        d.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest">Instruction Mode</Badge>
                        <div className="h-1 w-1 rounded-full bg-border" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{user?.department || 'ACADEMIC RESOURCE'}</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter leading-none uppercase">Research <span className="text-primary italic">Studio</span></h1>
                </motion.div>

                <div className="flex gap-3">
                    <Button variant="outline" className="h-12 rounded-full px-6 border-muted-foreground/20 text-[10px] font-black uppercase tracking-widest glass">
                        Archive Session
                    </Button>
                    <Button className="h-12 rounded-full px-8 bg-primary hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                        Export Intelligence
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    {/* Insights Hub */}
                    <div className="grid sm:grid-cols-3 gap-6">
                        {[
                            { label: 'Cloud Corpus', value: documents.length, icon: Database, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                            { label: 'Active Curricula', value: '03', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                            { label: 'Neural Accuracy', value: '98%', icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="glass border-primary/5 overflow-hidden card-hover">
                                    <CardContent className="p-8">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", stat.bg)}>
                                            <stat.icon className={cn("w-6 h-6", stat.color)} />
                                        </div>
                                        <div className="text-3xl font-black tracking-tighter mb-1">{stat.value}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Material Ingestion */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-1">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Knowledge Ingestion</h3>
                            <div className="h-[1px] flex-1 bg-primary/10" />
                        </div>

                        <Card className="glass border-dashed border-primary/20 rounded-[2.5rem] bg-muted/10">
                            <CardContent className="p-8">
                                <label className="group block cursor-pointer">
                                    <div className="h-44 border-2 border-dashed border-primary/10 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all group-hover:bg-primary/5 group-hover:border-primary/30 relative overflow-hidden">
                                        {uploading ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                                <span className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Processing Vector Nodes...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110">
                                                    <Upload className="w-8 h-8 text-primary" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-1">Upload Instructional Material</p>
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Neural Link supports PDF, DOCX, & Markdown</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" accept=".pdf,.docx,.txt,.md" onChange={handleUpload} />
                                </label>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Documents List */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Identity Records</h3>
                                <div className="h-4 w-[1px] bg-primary/20" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{filteredDocs.length} Resources Indexed</span>
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="SEARCH CORPUS..."
                                    className="pl-12 h-11 w-72 text-[10px] font-black uppercase tracking-widest rounded-full bg-muted/50 border-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-24 glass rounded-[2.5rem] border-primary/5">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary/20" />
                                </div>
                            ) : filteredDocs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 glass rounded-[2.5rem] border-primary/5 text-center">
                                    <Info className="w-10 h-10 text-muted-foreground/20 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No records found within active scope.</p>
                                </div>
                            ) : (
                                filteredDocs.map((doc, i) => (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group glass border-transparent hover:border-primary/20 p-6 rounded-[2rem] flex items-center justify-between transition-all cursor-default overflow-hidden relative"
                                    >
                                        <div className="flex items-center gap-6 relative z-10">
                                            <div className="h-14 w-14 rounded-2xl bg-card border flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                                                <FileText className="w-6 h-6 text-primary/60 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div>
                                                <p className="text-base font-bold tracking-tight mb-1">{doc.filename}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">{doc.department}</span>
                                                    <div className="h-1 w-1 rounded-full bg-border" />
                                                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">{doc.course}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 relative z-10">
                                            <div className="hidden sm:flex flex-col items-end">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Vectorized</span>
                                                <span className="text-[8px] font-bold text-muted-foreground uppercase">{new Date(doc.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>

                                        {/* Subtle background glow on hover */}
                                        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* AI Assistant Sidebar */}
                <div className="lg:col-span-4">
                    <div className="sticky top-10 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Brain className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest">Faculty Assistant</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
                                </div>
                            </div>

                            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/10 border border-primary/5">
                                <ChatWidget className="h-[650px]" />
                            </div>
                        </div>

                        <Card className="glass border-primary/10 rounded-[2rem] p-8 overflow-hidden relative">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Lock className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Session Integrity</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold italic">
                                    Identified as Faculty Advisor. All neural queries are routed through encrypted department-specific vector indices.
                                </p>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {['FERPA', 'AES-256', 'PINE_V4'].map(tag => (
                                        <Badge key={tag} className="bg-muted text-[8px] font-black tracking-widest rounded-lg border-none px-2 py-0.5">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
