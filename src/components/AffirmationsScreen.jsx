import React, { useState, useEffect } from 'react';

const AFFIRMATIONS = [
    { text: "I am worthy of love, rest, and kindness — especially from myself.", emoji: "💜", color: "#a855f7" },
    { text: "My feelings are valid. I give myself permission to feel without judgment.", emoji: "🌊", color: "#06b6d4" },
    { text: "I am doing the best I can with what I have right now.", emoji: "⭐", color: "#f59e0b" },
    { text: "Progress, not perfection. Every small step counts.", emoji: "🌱", color: "#22c55e" },
    { text: "I choose to release what I cannot control and focus on what I can.", emoji: "🌬️", color: "#60a5fa" },
    { text: "My mental health matters. Taking care of myself is not selfish.", emoji: "🧠", color: "#ec4899" },
    { text: "I have survived every hard day so far — I am stronger than I think.", emoji: "💪", color: "#f97316" },
    { text: "I am allowed to ask for help. Vulnerability is courage.", emoji: "🤝", color: "#a855f7" },
    { text: "This moment will pass. I breathe through it.", emoji: "🌸", color: "#ec4899" },
    { text: "I deserve peace, joy, and all the good things life has to offer.", emoji: "✨", color: "#f59e0b" },
    { text: "My past does not define me. Every day is a new beginning.", emoji: "🌅", color: "#f97316" },
    { text: "I trust myself to handle whatever comes my way today.", emoji: "🦋", color: "#22c55e" },
    { text: "I am enough, exactly as I am, right now in this moment.", emoji: "💫", color: "#a855f7" },
    { text: "Healing is not linear. I am gentle with myself on the tough days.", emoji: "🌿", color: "#06b6d4" },
    { text: "I radiate calm, and I attract good energy into my life.", emoji: "☀️", color: "#f59e0b" },
];

const CATEGORIES = [
    { label: 'All', filter: null, emoji: '✨' },
    { label: 'Self-Love', filter: ['💜', '💫', '⭐'], emoji: '💜' },
    { label: 'Strength', filter: ['💪', '🦋', '🌱'], emoji: '💪' },
    { label: 'Calm', filter: ['🌊', '🌬️', '🌸', '🌿', '☀️'], emoji: '🌊' },
];

export default function AffirmationsScreen({ theme }) {
    const [idx, setIdx] = useState(() => Math.floor(Math.random() * AFFIRMATIONS.length));
    const [catIdx, setCatIdx] = useState(0);
    const [liked, setLiked] = useState(() => JSON.parse(localStorage.getItem('aff_liked') || '[]'));
    const [animKey, setAnimKey] = useState(0);
    const [showAll, setShowAll] = useState(false);

    const cat = CATEGORIES[catIdx];
    const pool = cat.filter
        ? AFFIRMATIONS.filter(a => cat.filter.includes(a.emoji))
        : AFFIRMATIONS;

    const current = pool[idx % pool.length];
    const isLiked = liked.includes(current.text);

    const next = () => {
        setIdx(i => (i + 1) % pool.length);
        setAnimKey(k => k + 1);
    };
    const prev = () => {
        setIdx(i => (i - 1 + pool.length) % pool.length);
        setAnimKey(k => k + 1);
    };
    const toggleLike = () => {
        const next = isLiked ? liked.filter(t => t !== current.text) : [...liked, current.text];
        setLiked(next);
        localStorage.setItem('aff_liked', JSON.stringify(next));
    };

    // Auto-cycle every 30s when not interacting
    useEffect(() => {
        const t = setInterval(next, 30000);
        return () => clearInterval(t);
    }, [pool.length]);

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', padding: '24px 20px', maxWidth: 440, margin: '0 auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text, marginBottom: 4 }}>🌟 Daily Affirmations</h2>
            <p style={{ color: theme.subtext, fontSize: 14, marginBottom: 22 }}>
                Words that shape your inner world.
            </p>

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {CATEGORIES.map((c, i) => (
                    <button key={c.label} id={`aff-cat-${c.label.toLowerCase()}`}
                        onClick={() => { setCatIdx(i); setIdx(0); setAnimKey(k => k + 1); }}
                        style={{
                            padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
                            background: catIdx === i ? current.color + '22' : theme.card,
                            color: catIdx === i ? current.color : theme.subtext,
                            border: `1.5px solid ${catIdx === i ? current.color + '66' : theme.cardBorder}`,
                            fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                            transition: 'all 0.25s',
                        }}>
                        {c.emoji} {c.label}
                    </button>
                ))}
            </div>

            {/* Main Card */}
            <div key={animKey} style={{
                background: `linear-gradient(135deg, ${current.color}18, ${current.color}08)`,
                border: `1.5px solid ${current.color}44`,
                borderRadius: 28, padding: '36px 28px',
                textAlign: 'center', marginBottom: 20,
                animation: 'fadeSlide 0.5s ease forwards',
                boxShadow: `0 8px 40px ${current.color}22`,
            }}>
                <div style={{ fontSize: 52, marginBottom: 20 }}>{current.emoji}</div>
                <p style={{
                    fontSize: 18, fontWeight: 600, color: theme.text,
                    lineHeight: 1.65, margin: 0, letterSpacing: 0.2,
                }}>
                    "{current.text}"
                </p>
                <button id="aff-like" onClick={toggleLike} style={{
                    marginTop: 24, background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 22, transition: 'transform 0.2s',
                }}
                    title={isLiked ? 'Remove from favourites' : 'Add to favourites'}>
                    {isLiked ? '❤️' : '🤍'}
                </button>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                <button id="aff-prev" onClick={prev} style={{
                    flex: 1, padding: '14px', borderRadius: 16, cursor: 'pointer',
                    background: theme.card, border: `1.5px solid ${theme.cardBorder}`,
                    color: theme.subtext, fontSize: 15, fontWeight: 600,
                    fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                }}>← Previous</button>
                <button id="aff-next" onClick={next} style={{
                    flex: 1, padding: '14px', borderRadius: 16, cursor: 'pointer',
                    background: `linear-gradient(135deg, ${current.color}, ${current.color}cc)`,
                    border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
                    fontFamily: 'Inter, sans-serif',
                    boxShadow: `0 4px 20px ${current.color}44`,
                    transition: 'all 0.2s',
                }}>Next →</button>
            </div>

            {/* Pagination dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 28 }}>
                {pool.map((_, i) => (
                    <div key={i} onClick={() => { setIdx(i); setAnimKey(k => k + 1); }}
                        style={{
                            width: i === idx % pool.length ? 20 : 8,
                            height: 8, borderRadius: 999, cursor: 'pointer',
                            background: i === idx % pool.length ? current.color : theme.cardBorder,
                            transition: 'all 0.3s ease',
                        }} />
                ))}
            </div>

            {/* Favourites */}
            {liked.length > 0 && (
                <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 20, padding: '18px', backdropFilter: 'blur(10px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>❤️ Saved ({liked.length})</div>
                        <button onClick={() => setShowAll(s => !s)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 12, color: theme.accent, fontWeight: 600,
                        }}>{showAll ? 'Show less' : 'Show all'}</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(showAll ? liked : liked.slice(0, 3)).map((t, i) => {
                            const aff = AFFIRMATIONS.find(a => a.text === t);
                            return (
                                <div key={i} style={{
                                    fontSize: 13, color: theme.subtext, lineHeight: 1.55,
                                    padding: '10px 14px', borderRadius: 12,
                                    background: aff ? aff.color + '12' : theme.accentLight,
                                    borderLeft: `3px solid ${aff?.color || theme.accent}`,
                                }}>
                                    {aff?.emoji} "{t}"
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
