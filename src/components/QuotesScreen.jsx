import React, { useState, useEffect, useCallback } from 'react';

const QUOTES = [
    { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated. Having feelings doesn't make you a negative person.", author: "Lori Deschene", tag: "Feelings" },
    { text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", author: "Noam Shpancer", tag: "Journey" },
    { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush", tag: "Growth" },
    { text: "There is hope, even when your brain tells you there isn't.", author: "John Green", tag: "Hope" },
    { text: "Self-care is not self-indulgence. It is self-preservation.", author: "Audre Lorde", tag: "Self-Care" },
    { text: "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.", author: "Dumbledore", tag: "Hope" },
    { text: "It's okay to not be okay. What matters is that you keep going.", author: "Unknown", tag: "Resilience" },
    { text: "Your present circumstances don't determine where you go; they merely determine where you start.", author: "Nido Qubein", tag: "Growth" },
    { text: "The strongest people are those who win battles we know nothing about.", author: "Unknown", tag: "Strength" },
    { text: "Almost everything will work again if you unplug it for a few minutes — including you.", author: "Anne Lamott", tag: "Rest" },
    { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne", tag: "Strength" },
    { text: "What you think, you become. What you feel, you attract. What you imagine, you create.", author: "Buddha", tag: "Mindset" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", tag: "Growth" },
    { text: "Not all storms come to disrupt your life. Some come to clear your path.", author: "Unknown", tag: "Resilience" },
    { text: "Be gentle with yourself. You are a child of the universe, no less than the trees and the stars.", author: "Max Ehrmann", tag: "Self-Care" },
    { text: "The only journey is the one within.", author: "Rainer Maria Rilke", tag: "Journey" },
    { text: "You don't have to have it all figured out to move forward.", author: "Unknown", tag: "Growth" },
    { text: "She believed she could, so she did.", author: "R.S. Grey", tag: "Strength" },
];

const TAG_COLORS = {
    Feelings: '#ec4899', Journey: '#a855f7', Growth: '#22c55e', Hope: '#f59e0b',
    'Self-Care': '#06b6d4', Resilience: '#f97316', Strength: '#ef4444',
    Rest: '#60a5fa', Mindset: '#8b5cf6',
};

export default function QuotesScreen({ theme }) {
    const [idx, setIdx] = useState(0);
    const [animKey, setAnimKey] = useState(0);
    const [filter, setFilter] = useState(null);
    const [autoPlay, setAutoPlay] = useState(true);
    const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem('quotes_saved') || '[]'));
    const [timeLeft, setTimeLeft] = useState(15);

    const pool = filter ? QUOTES.filter(q => q.tag === filter) : QUOTES;
    const quote = pool[idx % pool.length];
    const color = TAG_COLORS[quote.tag] || '#a855f7';
    const tags = [...new Set(QUOTES.map(q => q.tag))];
    const isSaved = saved.some(s => s.text === quote.text);

    const goNext = useCallback(() => {
        setIdx(i => (i + 1) % pool.length);
        setAnimKey(k => k + 1);
        setTimeLeft(15);
    }, [pool.length]);

    const goPrev = () => {
        setIdx(i => (i - 1 + pool.length) % pool.length);
        setAnimKey(k => k + 1);
        setTimeLeft(15);
    };

    // Auto-advance with countdown
    useEffect(() => {
        if (!autoPlay) return;
        if (timeLeft <= 0) { goNext(); return; }
        const t = setTimeout(() => setTimeLeft(l => l - 1), 1000);
        return () => clearTimeout(t);
    }, [autoPlay, timeLeft, goNext]);

    const toggleSave = () => {
        const next = isSaved ? saved.filter(s => s.text !== quote.text) : [...saved, quote];
        setSaved(next);
        localStorage.setItem('quotes_saved', JSON.stringify(next));
    };

    const share = () => {
        if (navigator.share) {
            navigator.share({ text: `"${quote.text}" — ${quote.author}` });
        } else {
            navigator.clipboard?.writeText(`"${quote.text}" — ${quote.author}`);
        }
    };

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', padding: '24px 20px', maxWidth: 440, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>✨ Motivational Quotes</h2>
                <button id="quotes-autoplay" onClick={() => { setAutoPlay(a => !a); setTimeLeft(15); }}
                    style={{
                        background: autoPlay ? color + '22' : theme.card,
                        border: `1.5px solid ${autoPlay ? color : theme.cardBorder}`,
                        borderRadius: 999, padding: '6px 14px', cursor: 'pointer',
                        fontSize: 12, fontWeight: 700, color: autoPlay ? color : theme.subtext,
                        fontFamily: 'Inter, sans-serif', transition: 'all 0.25s',
                    }}>
                    {autoPlay ? `⏸ ${timeLeft}s` : '▶ Auto'}
                </button>
            </div>
            <p style={{ color: theme.subtext, fontSize: 14, marginBottom: 20 }}>Words that lift, inspire, and carry you.</p>

            {/* Tag Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
                <button onClick={() => { setFilter(null); setIdx(0); setAnimKey(k => k + 1); }}
                    style={tagBtn(!filter, '#a855f7', theme)}>All</button>
                {tags.map(tag => (
                    <button key={tag} id={`quote-tag-${tag}`}
                        onClick={() => { setFilter(tag); setIdx(0); setAnimKey(k => k + 1); }}
                        style={tagBtn(filter === tag, TAG_COLORS[tag] || '#a855f7', theme)}>
                        {tag}
                    </button>
                ))}
            </div>

            {/* Quote Card */}
            <div key={animKey} style={{
                background: `linear-gradient(145deg, ${color}18, ${color}06)`,
                border: `1.5px solid ${color}44`,
                borderRadius: 28, padding: '36px 28px',
                marginBottom: 20, animation: 'fadeSlide 0.5s ease forwards',
                boxShadow: `0 8px 40px ${color}18`,
            }}>
                {/* Auto-play progress bar */}
                {autoPlay && (
                    <div style={{ background: color + '22', borderRadius: 999, height: 3, marginBottom: 24, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', background: color, borderRadius: 999,
                            width: `${(timeLeft / 15) * 100}%`, transition: 'width 1s linear',
                        }} />
                    </div>
                )}

                {/* Tag badge */}
                <span style={{
                    background: color + '22', color, fontSize: 11, fontWeight: 700,
                    padding: '4px 12px', borderRadius: 999, letterSpacing: 0.5,
                }}>#{quote.tag}</span>

                <p style={{
                    fontSize: 18, fontWeight: 600, color: theme.text, lineHeight: 1.7,
                    margin: '20px 0 18px', letterSpacing: 0.1,
                }}>
                    "{quote.text}"
                </p>

                <div style={{ fontSize: 13, color: color, fontWeight: 700 }}>— {quote.author}</div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                    <button id="quote-save" onClick={toggleSave} style={{
                        flex: 1, padding: '10px', borderRadius: 12, cursor: 'pointer',
                        background: isSaved ? color + '22' : theme.card,
                        border: `1.5px solid ${isSaved ? color : theme.cardBorder}`,
                        color: isSaved ? color : theme.subtext,
                        fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.2s',
                    }}>{isSaved ? '❤️ Saved' : '🤍 Save'}</button>
                    <button id="quote-share" onClick={share} style={{
                        flex: 1, padding: '10px', borderRadius: 12, cursor: 'pointer',
                        background: theme.card, border: `1.5px solid ${theme.cardBorder}`,
                        color: theme.subtext, fontSize: 13, fontWeight: 700,
                        fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                    }}>📤 Share</button>
                </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <button id="quote-prev" onClick={goPrev} style={{
                    flex: 1, padding: '13px', borderRadius: 14, cursor: 'pointer',
                    background: theme.card, border: `1.5px solid ${theme.cardBorder}`,
                    color: theme.subtext, fontSize: 14, fontWeight: 600,
                    fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                }}>← Prev</button>
                <button id="quote-next" onClick={goNext} style={{
                    flex: 1, padding: '13px', borderRadius: 14, cursor: 'pointer',
                    background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                    border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                    fontFamily: 'Inter, sans-serif',
                    boxShadow: `0 4px 20px ${color}44`, transition: 'all 0.2s',
                }}>Next →</button>
            </div>

            {/* Progress */}
            <div style={{ textAlign: 'center', color: theme.subtext, fontSize: 12, marginBottom: 24 }}>
                {(idx % pool.length) + 1} / {pool.length} quotes
            </div>

            {/* Saved Quotes */}
            {saved.length > 0 && (
                <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 20, padding: '18px', backdropFilter: 'blur(10px)' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 14 }}>
                        ❤️ Your Collection ({saved.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {saved.slice(0, 3).map((q, i) => {
                            const c = TAG_COLORS[q.tag] || '#a855f7';
                            return (
                                <div key={i} style={{
                                    padding: '12px 14px', borderRadius: 14,
                                    background: c + '12', borderLeft: `3px solid ${c}`,
                                }}>
                                    <div style={{ fontSize: 12, color: theme.subtext, lineHeight: 1.6 }}>"{q.text}"</div>
                                    <div style={{ fontSize: 11, color: c, fontWeight: 700, marginTop: 4 }}>— {q.author}</div>
                                </div>
                            );
                        })}
                        {saved.length > 3 && (
                            <div style={{ fontSize: 12, color: theme.subtext, textAlign: 'center' }}>
                                + {saved.length - 3} more saved
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}

function tagBtn(active, color, theme) {
    return {
        padding: '7px 14px', borderRadius: 999, border: `1.5px solid ${active ? color + '88' : theme.cardBorder}`,
        background: active ? color + '22' : theme.card, color: active ? color : theme.subtext,
        fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        transition: 'all 0.2s',
    };
}
