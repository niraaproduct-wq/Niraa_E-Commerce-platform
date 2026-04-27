import React, { useState, useEffect, useCallback } from 'react';
import {
    sendBroadcast,
    getBroadcastLogs,
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBanner,
    getMarketingStats,
} from '../utils/marketingApi';

// ─── tiny SVG icon helper (same pattern as AdminPages.jsx) ────────────────────
const Ic = ({ d, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0 }}>
        <path d={d} />
    </svg>
);
const P = {
    send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
    plus: 'M12 5v14M5 12h14',
    trash: 'M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2',
    edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    toggle: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    clock: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
    check: 'M20 6L9 17l-5-5',
    warning: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
    users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
    megaphone: 'M3 11l19-9-9 19-2-8-8-2z',
    image: 'M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21',
    link: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
    x: 'M18 6L6 18M6 6l12 12',
    refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15',
    layout: 'M12 3H3v7h9V3zM21 3h-6v4h6V3zM21 10h-6v11h6V10zM12 13H3v8h9v-8z',
};

// ─── Reusable small components ────────────────────────────────────────────────
const Badge = ({ color, children }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 10.5, fontWeight: 700, padding: '3px 9px',
        borderRadius: 99, letterSpacing: '0.03em', whiteSpace: 'nowrap',
        color: `var(--${color})`,
        background: `var(--${color}-dim)`,
    }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: `var(--${color})` }} />
        {children}
    </span>
);

const Card = ({ children, style }) => (
    <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow)',
        ...style,
    }}>
        {children}
    </div>
);

const CardHeader = ({ title, subtitle, action }) => (
    <div style={{
        padding: '18px 22px', borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--surface-2)',
    }}>
        <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {action}
    </div>
);

const Input = ({ label, ...props }) => (
    <div>
        {label && <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 7, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--display)' }}>{label}</label>}
        <input {...props} style={{ width: '100%', padding: '10px 14px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s', ...props.style }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        />
    </div>
);

// ─── Stat mini-card ───────────────────────────────────────────────────────────
const MiniStat = ({ label, value, icon, color = 'accent' }) => (
    <div style={{
        background: 'var(--surface-3)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
    }}>
        <div style={{
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: `color-mix(in srgb, var(--${color}) 12%, transparent)`,
            border: `1px solid color-mix(in srgb, var(--${color}) 20%, transparent)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: `var(--${color})`,
        }}>
            <Ic d={icon} size={16} />
        </div>
        <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{value ?? '—'}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
        </div>
    </div>
);

// ─── Banner Form Modal ────────────────────────────────────────────────────────
const BannerForm = ({ initial, onSave, onClose, saving }) => {
    const [form, setForm] = useState({
        title: initial?.title || '',
        subtitle: initial?.subtitle || '',
        imageUrl: initial?.imageUrl || '',
        link: initial?.link || '',
        order: initial?.order ?? 0,
    });
    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={onClose}>
            <div style={{
                background: 'var(--surface)', border: '1px solid var(--border-active)',
                borderRadius: 'var(--radius-xl)', padding: 28, width: '100%', maxWidth: 460,
                boxShadow: 'var(--shadow-lg)', position: 'relative',
            }} onClick={e => e.stopPropagation()}>
                <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
                    {initial ? 'Edit Banner' : 'New Banner'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Input label="Title *" value={form.title} onChange={set('title')} placeholder="e.g. Deep Cleaning Combo — ₹550" />
                    <Input label="Subtitle" value={form.subtitle} onChange={set('subtitle')} placeholder="Optional tagline or description" />
                    <Input label="Image URL" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." />
                    <Input label="Link URL" value={form.link} onChange={set('link')} placeholder="https://..." />
                    <Input label="Display Order" type="number" value={form.order} onChange={set('order')} style={{ width: 100 }} />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ padding: '9px 18px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button
                        disabled={!form.title.trim() || saving}
                        onClick={() => onSave(form)}
                        style={{ padding: '9px 20px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', color: '#021a14', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: !form.title.trim() || saving ? 0.5 : 1 }}>
                        {saving ? 'Saving…' : initial ? 'Update Banner' : 'Create Banner'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const AdminMarketing = () => {
    // Broadcast state
    const [msg, setMsg] = useState('Hi Dharmapuri! 🎉 Check out our latest offers on cleaning products. Reply YES to order!');
    const [sending, setSending] = useState(false);
    const [broadcastResult, setBroadcastResult] = useState(null); // { type: 'success'|'error', text }
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(true);

    // Banner state
    const [banners, setBanners] = useState([]);
    const [bannersLoading, setBannersLoading] = useState(true);
    const [showBannerForm, setShowBannerForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [bannerSaving, setBannerSaving] = useState(false);

    // Stats state
    const [stats, setStats] = useState(null);

    const loadAll = useCallback(async () => {
        try {
            const [logsData, bannersData, statsData] = await Promise.all([
                getBroadcastLogs(),
                getBanners(),
                getMarketingStats(),
            ]);
            setLogs(logsData);
            setBanners(bannersData);
            setStats(statsData);
        } catch (e) {
            console.error('Marketing load error:', e);
        } finally {
            setLogsLoading(false);
            setBannersLoading(false);
        }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    // ── Broadcast handlers ──────────────────────────────────────────────────────
    const handleSend = async () => {
        if (!msg.trim() || sending) return;
        setSending(true);
        setBroadcastResult(null);
        try {
            const res = await sendBroadcast(msg.trim());
            setBroadcastResult({ type: 'success', text: res.message });
            // Refresh logs after a short delay to let the server update
            setTimeout(() => getBroadcastLogs().then(setLogs).catch(() => { }), 2000);
        } catch (e) {
            setBroadcastResult({ type: 'error', text: e.message });
        } finally {
            setSending(false);
        }
    };

    // ── Banner handlers ─────────────────────────────────────────────────────────
    const handleCreateBanner = async (form) => {
        setBannerSaving(true);
        try {
            const newBanner = await createBanner(form);
            setBanners((prev) => [newBanner, ...prev]);
            setShowBannerForm(false);
        } catch (e) {
            alert(e.message);
        } finally {
            setBannerSaving(false);
        }
    };

    const handleUpdateBanner = async (form) => {
        if (!editingBanner) return;
        setBannerSaving(true);
        try {
            const updated = await updateBanner(editingBanner._id, form);
            setBanners((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
            setEditingBanner(null);
        } catch (e) {
            alert(e.message);
        } finally {
            setBannerSaving(false);
        }
    };

    const handleDeleteBanner = async (id) => {
        if (!window.confirm('Delete this banner?')) return;
        try {
            await deleteBanner(id);
            setBanners((prev) => prev.filter((b) => b._id !== id));
        } catch (e) {
            alert(e.message);
        }
    };

    const handleToggleBanner = async (id) => {
        try {
            const updated = await toggleBanner(id);
            setBanners((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
        } catch (e) {
            alert(e.message);
        }
    };

    const relativeTime = (dateStr) => {
        if (!dateStr) return '—';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
                <MiniStat label="Reachable Customers" value={stats?.reachableCustomers ?? '…'} icon={P.users} color="accent" />
                <MiniStat label="Broadcasts Sent" value={stats?.totalBroadcasts ?? '…'} icon={P.send} color="purple" />
                <MiniStat label="Last Broadcast" value={relativeTime(stats?.lastBroadcastAt)} icon={P.clock} color="amber" />
                <MiniStat label="Active Banners" value={stats?.activeBanners ?? '…'} icon={P.layout} color="blue" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18, alignItems: 'start' }}>

                {/* ── WhatsApp Broadcast ── */}
                <Card>
                    <CardHeader
                        title="📣 WhatsApp / SMS Broadcast"
                        subtitle={`Send to all ${stats?.reachableCustomers ?? '—'} reachable customers`}
                    />
                    <div style={{ padding: 20 }}>
                        <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 7, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--display)' }}>
                            Message
                        </label>
                        <textarea
                            value={msg}
                            onChange={e => setMsg(e.target.value)}
                            rows={5}
                            style={{
                                width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                                background: 'var(--surface-3)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)', fontFamily: 'var(--sans)',
                                fontSize: 13.5, color: 'var(--text-primary)', resize: 'vertical',
                                outline: 'none', lineHeight: 1.6,
                            }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, marginBottom: 14 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{msg.length} chars</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>~{Math.ceil(msg.length / 160)} SMS segment{Math.ceil(msg.length / 160) !== 1 ? 's' : ''}</span>
                        </div>

                        {broadcastResult && (
                            <div style={{
                                marginBottom: 14, padding: '10px 14px', borderRadius: 'var(--radius)',
                                background: broadcastResult.type === 'success' ? 'var(--green-dim)' : 'var(--red-dim)',
                                border: `1px solid ${broadcastResult.type === 'success' ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                                color: broadcastResult.type === 'success' ? 'var(--green)' : 'var(--red)',
                                fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7,
                            }}>
                                <Ic d={broadcastResult.type === 'success' ? P.check : P.warning} size={14} />
                                {broadcastResult.text}
                            </div>
                        )}

                        <button
                            disabled={sending || !msg.trim()}
                            onClick={handleSend}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '11px', background: sending || !msg.trim() ? 'rgba(37,211,102,0.4)' : '#25D366',
                                color: '#fff', border: 'none', borderRadius: 'var(--radius)',
                                fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 13.5,
                                cursor: sending || !msg.trim() ? 'not-allowed' : 'pointer',
                                transition: 'filter 0.15s, transform 0.15s',
                                boxShadow: sending ? 'none' : '0 2px 12px rgba(37,211,102,0.3)',
                            }}
                            onMouseEnter={e => { if (!sending) { e.target.style.filter = 'brightness(1.08)'; e.target.style.transform = 'translateY(-1px)'; } }}
                            onMouseLeave={e => { e.target.style.filter = ''; e.target.style.transform = ''; }}>
                            <Ic d={P.send} size={15} />
                            {sending ? 'Queuing broadcast…' : 'Send Broadcast'}
                        </button>
                    </div>
                </Card>

                {/* ── Banners ── */}
                <Card>
                    <CardHeader
                        title="🖼️ Promotional Banners"
                        subtitle="Manage storefront banners"
                        action={
                            <button
                                onClick={() => setShowBannerForm(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', background: 'var(--accent-dim)', border: '1px solid rgba(46,184,154,0.2)', borderRadius: 'var(--radius)', color: 'var(--accent)', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                <Ic d={P.plus} size={13} /> Add Banner
                            </button>
                        }
                    />
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {bannersLoading ? (
                            [1, 2].map(i => (
                                <div key={i} style={{ height: 64, borderRadius: 'var(--radius)', background: 'var(--surface-3)', animation: 'shimmer 1.5s infinite', backgroundSize: '800px 100%', backgroundImage: 'linear-gradient(90deg, var(--surface-3) 25%, var(--surface-2) 50%, var(--surface-3) 75%)' }} />
                            ))
                        ) : banners.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>No banners yet</div>
                                <div style={{ fontSize: 12, marginTop: 4 }}>Click "Add Banner" to create one</div>
                            </div>
                        ) : (
                            banners.map(banner => (
                                <div key={banner._id} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 14px', background: 'var(--surface-3)',
                                    border: `1px solid ${banner.isActive ? 'rgba(46,184,154,0.15)' : 'var(--border)'}`,
                                    borderRadius: 'var(--radius)', transition: 'border-color 0.15s',
                                }}>
                                    {banner.imageUrl ? (
                                        <img src={banner.imageUrl} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                                    ) : (
                                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-muted)' }}>
                                            <Ic d={P.image} size={16} />
                                        </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner.title}</div>
                                        {banner.subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner.subtitle}</div>}
                                    </div>
                                    <Badge color={banner.isActive ? 'green' : 'text-muted'}>{banner.isActive ? 'Live' : 'Off'}</Badge>
                                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                        <button onClick={() => handleToggleBanner(banner._id)} title="Toggle active" style={{ padding: 7, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>
                                            <Ic d={P.toggle} size={13} />
                                        </button>
                                        <button onClick={() => setEditingBanner(banner)} title="Edit" style={{ padding: 7, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>
                                            <Ic d={P.edit} size={13} />
                                        </button>
                                        <button onClick={() => handleDeleteBanner(banner._id)} title="Delete" style={{ padding: 7, background: 'var(--red-dim)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 8, color: 'var(--red)', cursor: 'pointer' }}>
                                            <Ic d={P.trash} size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            {/* ── Broadcast Logs ── */}
            <Card>
                <CardHeader
                    title="📋 Broadcast History"
                    subtitle="Last 20 campaigns"
                    action={
                        <button onClick={loadAll} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            <Ic d={P.refresh} size={13} /> Refresh
                        </button>
                    }
                />
                {logsLoading ? (
                    <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[1, 2, 3].map(i => <div key={i} style={{ height: 40, borderRadius: 'var(--radius)', background: 'var(--surface-3)', animation: 'shimmer 1.5s infinite' }} />)}
                    </div>
                ) : logs.length === 0 ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>No broadcasts sent yet</div>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--surface-2)' }}>
                                    {['Message', 'Channel', 'Recipients', 'Status', 'Sent By', 'Time'].map(h => (
                                        <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap', fontFamily: 'var(--display)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => {
                                    const statusColor = { sent: 'green', failed: 'red', pending: 'amber', partial: 'amber' }[log.status] || 'text-muted';
                                    return (
                                        <tr key={log._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                            onMouseLeave={e => e.currentTarget.style.background = ''}>
                                            <td style={{ padding: '13px 18px', maxWidth: 260 }}>
                                                <div style={{ fontSize: 12.5, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.message}</div>
                                            </td>
                                            <td style={{ padding: '13px 18px' }}>
                                                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-secondary)', background: 'var(--surface-3)', padding: '2px 8px', borderRadius: 6 }}>
                                                    {log.channel}
                                                </span>
                                            </td>
                                            <td style={{ padding: '13px 18px', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {log.recipientCount.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '13px 18px' }}>
                                                <Badge color={statusColor}>{log.status}</Badge>
                                            </td>
                                            <td style={{ padding: '13px 18px', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                                                {log.sentBy?.name || 'Admin'}
                                            </td>
                                            <td style={{ padding: '13px 18px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>
                                                {relativeTime(log.createdAt)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Banner form modal */}
            {(showBannerForm || editingBanner) && (
                <BannerForm
                    initial={editingBanner}
                    saving={bannerSaving}
                    onSave={editingBanner ? handleUpdateBanner : handleCreateBanner}
                    onClose={() => { setShowBannerForm(false); setEditingBanner(null); }}
                />
            )}
        </div>
    );
};

export default AdminMarketing;