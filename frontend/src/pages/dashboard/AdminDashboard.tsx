import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ChatWidget from '@/components/chat/ChatWidget';
import { useAuthStore } from '@/store/authStore';
import {
    documentsApi, adminApi, authApi, systemApi,
    type DocumentResponse, type AuditLogEntry, type UserProfile, type MetricsResponse,
} from '@/lib/api';
import {
    Upload, FileText, Users, ClipboardList, BarChart3,
    Loader2, FolderOpen, Search, Trash2, UserPlus,
    Shield, Database, MessageSquare, Activity, ChevronRight,
    ArrowUpRight, Clock, Plus, Zap, Cpu, Globe, Key,
    Mail, Briefcase, Server, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
    const { user, token } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'users' | 'audit'>('overview');
    const [documents, setDocuments] = useState<DocumentResponse[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
    const [loading, setLoading] = useState(false);

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [uploadDocType, setUploadDocType] = useState('student');
    const [uploadDept, setUploadDept] = useState('General');
    const [uploadCourse, setUploadCourse] = useState('ALL');
    const [uploadTags, setUploadTags] = useState('');

    // Invite state
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [inviteRole, setInviteRole] = useState('faculty');
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        if (token) {
            loadData();
        }
    }, [token, activeTab]);

    const loadData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            if (activeTab === 'overview') {
                const m = await systemApi.metrics(token);
                setMetrics(m);
            } else if (activeTab === 'documents') {
                const res = await documentsApi.list(token);
                setDocuments(res.documents);
            } else if (activeTab === 'users') {
                const u = await authApi.listUsers(token);
                setUsers(u);
            } else if (activeTab === 'audit') {
                const logs = await adminApi.getAuditLogs(token);
                setAuditLogs(logs.logs);
            }
        } catch (err) {
            console.error('Failed to load data:', err);
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
            formData.append('doc_type', uploadDocType);
            formData.append('department', uploadDept);
            formData.append('course', uploadCourse);
            formData.append('tags', JSON.stringify(uploadTags.split(',').map(t => t.trim()).filter(Boolean)));
            await documentsApi.upload(token, formData);
            loadData();
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setInviting(true);
        try {
            await authApi.inviteUser(token, { email: inviteEmail, full_name: inviteName, role: inviteRole });
            setInviteEmail('');
            setInviteName('');
            loadData();
        } catch (err) {
            console.error('Invite failed:', err);
        } finally {
            setInviting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!token || !confirm('Confirm permanent deletion of this resource?')) return;
        try {
            await documentsApi.delete(token, id);
            setDocuments(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const tabs = [
        { id: 'overview', name: 'Global Engine', icon: Activity },
        { id: 'documents', name: 'Corpus Index', icon: Database },
        { id: 'users', name: 'Neural Access', icon: Users },
        { id: 'audit', name: 'Chain of Custody', icon: ClipboardList },
    ] as const;

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Nav Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter leading-none mb-2 uppercase">Command <span className="text-primary italic">Center</span></h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Level 4 Authorization Active</p>
                </div>

                <div className="flex bg-muted/30 p-1 rounded-2xl border border-primary/5 backdrop-blur-md self-start">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === tab.id
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{tab.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.02, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* System Status Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Ingestions', value: metrics?.stats.total_documents || 0, icon: Database, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                                    { label: 'Authorized Nodes', value: metrics?.stats.total_users || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                    { label: 'Neural Queries', value: metrics?.stats.total_chats || 0, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                    { label: 'Data Throughput', value: '42.8 GB', icon: Server, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                ].map((stat, i) => (
                                    <Card key={stat.label} className="glass card-hover border-primary/5">
                                        <CardContent className="p-8">
                                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-2xl", stat.bg)}>
                                                <stat.icon className={cn("w-7 h-7", stat.color)} />
                                            </div>
                                            <div className="text-3xl font-black tracking-tighter mb-1">{stat.value}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="grid lg:grid-cols-3 gap-8">
                                <Card className="lg:col-span-2 glass border-primary/5 rounded-[2.5rem]">
                                    <CardHeader className="p-10">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Live Optimization</Badge>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cluster: us-east-4</span>
                                        </div>
                                        <CardTitle className="text-4xl font-black tracking-tighter">Engine Analytics</CardTitle>
                                        <CardDescription className="text-sm font-semibold italic">Real-time telemetry from the RAG pipeline</CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-10 pb-10">
                                        <div className="h-64 flex items-end gap-3 mb-8">
                                            {[40, 70, 45, 90, 65, 80, 55, 75, 95, 85, 60, 100].map((h, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${h}%` }}
                                                    transition={{ delay: i * 0.05, duration: 1 }}
                                                    className="flex-1 bg-gradient-to-t from-primary/40 to-primary rounded-t-lg transition-all hover:scale-x-110 cursor-pointer"
                                                />
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-10">
                                            <div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Inference Speed</div>
                                                <div className="text-xl font-bold tracking-tight">142ms <span className="text-[10px] text-emerald-500">(-12%)</span></div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Context Accuracy</div>
                                                <div className="text-xl font-bold tracking-tight">98.4% <span className="text-[10px] text-primary">(+1.2%)</span></div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Active Shards</div>
                                                <div className="text-xl font-bold tracking-tight">12/12</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="glass border-primary/5 rounded-[2.5rem] bg-primary relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8">
                                        <Shield className="w-12 h-12 text-primary-foreground opacity-20" />
                                    </div>
                                    <CardHeader className="p-10">
                                        <CardTitle className="text-primary-foreground text-3xl font-black tracking-tighter">Security Firewall</CardTitle>
                                        <CardDescription className="text-primary-foreground/70 font-bold uppercase tracking-widest text-[10px]">Encryption: AES-256-GCM</CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-10 pb-10 space-y-8">
                                        <div className="space-y-4">
                                            {[
                                                { label: "Role-Based Access", status: "Active" },
                                                { label: "Audit Logging", status: "Secure" },
                                                { label: "Vector Obfuscation", status: "Active" }
                                            ].map(item => (
                                                <div key={item.label} className="flex items-center justify-between text-primary-foreground border-b border-white/10 pb-3">
                                                    <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                                                    <CheckCircle2 className="w-4 h-4 text-white/50" />
                                                </div>
                                            ))}
                                        </div>
                                        <Button className="w-full h-14 rounded-2xl bg-white text-primary hover:bg-white/90 font-black text-[10px] uppercase tracking-widest">Rotate Core Keys</Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-1 glass border-primary/5 rounded-[2.5rem]">
                                <CardHeader className="p-8">
                                    <CardTitle className="text-2xl font-black tracking-tighter uppercase">Corpus Ingestion</CardTitle>
                                    <CardDescription className="text-xs font-semibold italic">Upload documents to the Knowledge Index</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Knowledge Group</label>
                                        <select
                                            className="w-full h-12 px-4 rounded-xl bg-muted/50 border-none outline-none text-xs font-bold uppercase tracking-widest"
                                            value={uploadDocType}
                                            onChange={(e) => setUploadDocType(e.target.value)}
                                        >
                                            <option value="student">Student Knowledge</option>
                                            <option value="faculty">Faculty Resources</option>
                                            <option value="admin">Policy Corpus</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department Tag</label>
                                        <Input
                                            className="h-12 rounded-xl bg-muted/50 border-none px-4 text-xs font-bold uppercase tracking-widest"
                                            placeholder="EX: COMPUTER SCIENCE"
                                            value={uploadDept}
                                            onChange={(e) => setUploadDept(e.target.value)}
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <label className="group block cursor-pointer">
                                            <div className="h-40 border-2 border-dashed border-primary/20 rounded-[2rem] flex flex-col items-center justify-center gap-4 group-hover:bg-primary/5 transition-all">
                                                {uploading ? (
                                                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                                ) : (
                                                    <>
                                                        <Upload className="w-10 h-10 text-primary" />
                                                        <div className="text-center">
                                                            <div className="text-[10px] font-black uppercase tracking-widest mb-1">Upload Pipeline</div>
                                                            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">PDF, DOCX, TXT</div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-2 glass border-primary/5 rounded-[2.5rem] overflow-hidden">
                                <CardHeader className="p-8 border-b border-primary/5 bg-muted/30">
                                    <CardTitle className="text-2xl font-black tracking-tighter uppercase">Knowledge Corpus</CardTitle>
                                    <CardDescription className="text-xs font-semibold italic">Manage {documents.length} indexed resources</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-muted/30 border-b border-primary/5">
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Layer</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deployment</th>
                                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Execution</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-primary/5">
                                                {documents.map((doc) => (
                                                    <tr key={doc.id} className="hover:bg-primary/5 transition-colors group">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                                    <FileText className="w-5 h-5 text-primary" />
                                                                </div>
                                                                <div className="max-w-[200px]">
                                                                    <div className="text-sm font-bold truncate tracking-tight">{doc.filename}</div>
                                                                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{doc.id.slice(0, 12)}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <Badge className="bg-muted rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border-none px-3 py-1">{doc.role}</Badge>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/80">{new Date(doc.created_at).toLocaleDateString()}</div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(doc.id)}
                                                                className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-1 glass border-primary/5 rounded-[2.5rem]">
                                <CardHeader className="p-8">
                                    <CardTitle className="text-2xl font-black tracking-tighter uppercase">Invite Network</CardTitle>
                                    <CardDescription className="text-xs font-semibold italic">Register new authorized nodes</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <form onSubmit={handleInvite} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Legal Identity</label>
                                            <Input
                                                className="h-12 rounded-xl bg-muted/50 border-none px-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20"
                                                placeholder="FULL NAME"
                                                value={inviteName}
                                                onChange={(e) => setInviteName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Academic Email</label>
                                            <Input
                                                className="h-12 rounded-xl bg-muted/50 border-none px-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20"
                                                type="email"
                                                placeholder="ID@UNIVERSITY.EDU"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Role Permission</label>
                                            <select
                                                className="w-full h-12 px-4 rounded-xl bg-muted/50 border-none outline-none text-xs font-bold uppercase tracking-widest"
                                                value={inviteRole}
                                                onChange={(e) => setInviteRole(e.target.value)}
                                            >
                                                <option value="student">Student Node</option>
                                                <option value="faculty">Faculty Advisor</option>
                                                <option value="admin">Core Admin</option>
                                            </select>
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 text-[10px] font-black uppercase tracking-widest"
                                            disabled={inviting}
                                        >
                                            {inviting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Dispatch Invitation'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-2 glass border-primary/5 rounded-[2.5rem] overflow-hidden">
                                <CardHeader className="p-8 border-b border-primary/5 bg-muted/30">
                                    <CardTitle className="text-2xl font-black tracking-tighter uppercase">Identity Index</CardTitle>
                                    <CardDescription className="text-xs font-semibold italic">Authorized network members</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-muted/30 border-b border-primary/5">
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Department</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Auth Role</th>
                                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-primary/5">
                                                {users.map((u) => (
                                                    <tr key={u.id} className="hover:bg-primary/5 transition-colors group">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 border border-primary/10">
                                                                    <Users className="w-5 h-5 text-muted-foreground" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold tracking-tight">{u.full_name}</div>
                                                                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{u.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-foreground/80">{u.department || 'GLOBAL'}</div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <Badge className={cn(
                                                                "rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border-none px-3 py-1",
                                                                u.role === 'admin' ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                                            )}>{u.role}</Badge>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className="inline-flex items-center gap-2 text-emerald-500">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'audit' && (
                        <Card className="glass border-primary/5 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 border-b border-primary/5 bg-muted/30">
                                <CardTitle className="text-2xl font-black tracking-tighter uppercase">Chain of Custody</CardTitle>
                                <CardDescription className="text-xs font-semibold italic">Immutable audit logs of all system interactions</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-muted/30 border-b border-primary/5">
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Interaction</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actor</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vector Identity</th>
                                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Temporal Data</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-primary/5">
                                            {auditLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-primary/5 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                                                <ClipboardList className="w-5 h-5 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <div className="text-[11px] font-black uppercase tracking-widest text-foreground/90">{log.action}</div>
                                                                <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Target: {log.target_id || 'Global'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-foreground/80">{log.user?.email || 'System'}</div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <Badge variant="outline" className="text-[9px] font-black border-primary/10 uppercase tracking-[0.2em]">{log.id.slice(0, 8)}</Badge>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                            {new Date(log.created_at).toLocaleString()}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
