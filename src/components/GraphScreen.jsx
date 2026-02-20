import React, { useState, useEffect } from 'react';
import { MOODS } from '../constants/moods.js';
import { listenEntries } from '../utils/db.js';

export default function GraphScreen({ theme, user }) {
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        const unsub = listenEntries(user.uid, setEntries);
        return () => typeof unsub === 'function' && unsub();
    }, [user.uid]);

    const last10 = [...entries].slice(0, 10).reverse();

    const counts = {};
    MOODS.forEach(m => { counts[m.label] = 0; });
    entries.forEach(e => {
        const m = MOODS.find(x => x.emoji === e.mood);
        if (m) counts[m.label]++;
    });
    const maxCount = Math.max(...Object.values(counts), 1);

    const W = 340, H = 120, PAD = 20;
    const pts = last10.map((e, i) => {
        const m = MOODS.find(x => x.emoji === e.mood);
        const v = m ? m.value : 3;
        const x = PAD + (i / Math.max(last10.length - 1, 1)) * (W - PAD * 2);
        const y = H - PAD - ((v - 1) / 4) * (H - PAD * 2);
        return { x, y, mood: m };
    });
    const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', padding: '24px 20px', maxWidth: 440, margin: '0 auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text, marginBottom: 6 }}>📊 Mood Stats</h2>
            <p style={{ color: theme.subtext, fontSize: 14, marginBottom: 24 }}>Understand your emotional patterns.</p>

            {entries.length < 2 ? (
                <div style={{
                    background: theme.card + 'cc', border: `1px solid ${theme.cardBorder}`,
                    borderRadius: 20, padding: '48px 24px', textAlign: 'center', backdropFilter: 'blur(10px)',
                }}>
                    <div style={{ fontSize: 48, marginBottom: 14 }}>📈</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, marginBottom: 8 }}>Not enough data yet</div>
                    <div style={{ fontSize: 14, color: theme.subtext }}>Add at least 2 journal entries to see your chart.</div>
                </div>
            ) : (
                <>
                    <div style={{
                        background: theme.card + 'cc', border: `1px solid ${theme.cardBorder}`,
                        borderRadius: 20, padding: '20px', marginBottom: 20, backdropFilter: 'blur(10px)',
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: theme.subtext, marginBottom: 12 }}>Last {last10.length} entries</div>
                        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
                            {[1, 2, 3, 4, 5].map(v => {
                                const y = H - PAD - ((v - 1) / 4) * (H - PAD * 2);
                                const m = MOODS.find(x => x.value === v);
                                return (
                                    <g key={v}>
                                        <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke={theme.cardBorder} strokeDasharray="4" />
                                        <text x={0} y={y + 4} fontSize={10} fill={theme.subtext}>{m?.emoji}</text>
                                    </g>
                                );
                            })}
                            {pts.length > 1 && (
                                <polyline points={polyline} fill="none" stroke={theme.accent} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                            )}
                            {pts.map((p, i) => (
                                <g key={i}>
                                    <circle cx={p.x} cy={p.y} r={6} fill={p.mood?.color || theme.accent} />
                                    <circle cx={p.x} cy={p.y} r={3} fill="#fff" />
                                </g>
                            ))}
                        </svg>
                    </div>

                    <div style={{
                        background: theme.card + 'cc', border: `1px solid ${theme.cardBorder}`,
                        borderRadius: 20, padding: '20px', backdropFilter: 'blur(10px)',
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: theme.subtext, marginBottom: 16 }}>Mood Breakdown</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {MOODS.map(m => (
                                <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 20, minWidth: 28 }}>{m.emoji}</span>
                                    <span style={{ fontSize: 13, color: theme.subtext, minWidth: 46 }}>{m.label}</span>
                                    <div style={{ flex: 1, background: theme.inputBg, borderRadius: 999, height: 10, overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${(counts[m.label] / maxCount) * 100}%`, height: '100%',
                                            background: m.color, borderRadius: 999, transition: 'width 0.6s ease',
                                            minWidth: counts[m.label] > 0 ? 10 : 0,
                                        }} />
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: theme.text, minWidth: 20, textAlign: 'right' }}>{counts[m.label]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginTop: 20, textAlign: 'center', color: theme.subtext, fontSize: 13 }}>
                        {entries.length} total entries · Keep going 💜
                    </div>
                </>
            )}
        </div>
    );
}
