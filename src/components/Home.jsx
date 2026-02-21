import React, { useState, useEffect } from 'react';
import { MOODS } from '../constants/moods.js';
import { listenEntries } from '../utils/db.js';

function getStreak(entries) {
    if (!entries.length) return 0;
    const days = new Set(entries.map(e => new Date(e.date).toDateString()));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        if (days.has(d.toDateString())) streak++;
        else break;
    }
    return streak;
}

function getGreeting(name) {
    const h = new Date().getHours();
    if (h < 12) return `Good morning, ${name} ☀️`;
    if (h < 17) return `Good afternoon, ${name} 🌤️`;
    return `Good evening, ${name} 🌙`;
}

export default function Home({ theme, user, onNav, onLogout }) {
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        const unsub = listenEntries(user.uid, setEntries);
        return () => typeof unsub === 'function' && unsub();
    }, [user.uid]);

    const streak = getStreak(entries);
    const lastMood = entries.length ? MOODS.find(m => m.emoji === entries[0].mood) : null;

    // Streak milestone labels
    const streakMilestone = streak >= 30 ? { label: '🏆 Legend', color: '#f59e0b' }
        : streak >= 14 ? { label: '💎 Diamond', color: '#06b6d4' }
            : streak >= 7 ? { label: '🔥 On Fire!', color: '#ef4444' }
                : streak >= 3 ? { label: '⭐ Building', color: '#a855f7' }
                    : streak >= 1 ? { label: '🌱 Starting', color: '#22c55e' }
                        : null;

    const cards = [
        { id: 'nav-journal', emoji: '📓', label: 'Journal', sub: 'Write your thoughts', screen: 'journal', color: '#a855f7' },
        { id: 'nav-breathe', emoji: '🧘', label: 'Breathe', sub: 'Guided breathing', screen: 'breathe', color: '#06b6d4' },
        { id: 'nav-focus', emoji: '🎯', label: 'Focus Mode', sub: 'Deep work sessions', screen: 'focus', color: '#ef4444' },
        { id: 'nav-timer', emoji: '⏰', label: 'Break Timer', sub: 'Take a mindful break', screen: 'timer', color: '#ec4899' },
        { id: 'nav-affirm', emoji: '🌟', label: 'Affirmations', sub: 'Daily positive words', screen: 'affirm', color: '#f59e0b' },
        { id: 'nav-quotes', emoji: '✨', label: 'Quotes', sub: 'Get inspired now', screen: 'quotes', color: '#10b981' },
        { id: 'nav-graph', emoji: '📊', label: 'Mood Stats', sub: 'See your patterns', screen: 'graph', color: '#06b6d4' },
        { id: 'nav-calendar', emoji: '📅', label: 'Calendar', sub: 'Your mood history', screen: 'calendar', color: '#22c55e' },
        { id: 'nav-prompt', emoji: '💭', label: 'Daily Prompt', sub: 'Reflect for a moment', screen: 'prompt', color: '#8b5cf6' },
    ];

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', padding: '24px 20px', maxWidth: 440, margin: '0 auto' }}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.text, margin: '0 0 4px' }}>
                    {getGreeting(user.name)}
                </h1>
                <p style={{ color: theme.subtext, fontSize: 14, margin: 0 }}>How are you feeling today?</p>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                {/* Streak Card — enhanced */}
                <div style={{
                    flex: 1, borderRadius: 18, padding: '16px', textAlign: 'center',
                    background: streakMilestone
                        ? `linear-gradient(135deg, ${streakMilestone.color}22, ${streakMilestone.color}10)`
                        : `${theme.card}cc`,
                    border: `1px solid ${streakMilestone ? streakMilestone.color + '55' : theme.cardBorder}`,
                    boxShadow: streakMilestone ? `0 4px 20px ${streakMilestone.color}22` : theme.shadowCard,
                    backdropFilter: 'blur(10px)', transition: 'all 0.4s ease',
                }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: streakMilestone?.color || theme.accent }}>
                        {streak}
                    </div>
                    <div style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }}>Day streak 🔥</div>
                    {streakMilestone && (
                        <div style={{
                            marginTop: 6, fontSize: 10, fontWeight: 700,
                            color: streakMilestone.color,
                            background: streakMilestone.color + '22',
                            borderRadius: 999, padding: '2px 8px', display: 'inline-block',
                        }}>{streakMilestone.label}</div>
                    )}
                </div>

                {[{ label: 'Total entries', value: entries.length },
                { label: 'Last mood', value: lastMood ? lastMood.emoji : '—', isEmoji: true }]
                    .map((s, i) => (
                        <div key={i} style={{
                            flex: 1, background: `${theme.card}cc`, border: `1px solid ${theme.cardBorder}`,
                            borderRadius: 18, padding: '16px', boxShadow: theme.shadowCard, textAlign: 'center',
                            backdropFilter: 'blur(10px)',
                        }}>
                            <div style={{ fontSize: 28, fontWeight: s.isEmoji ? 400 : 800, color: theme.accent }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: theme.subtext, marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
            </div>

            {/* Quick Actions */}
            <h2 style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 14 }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {cards.map(c => (
                    <button key={c.screen} id={c.id} onClick={() => onNav(c.screen)}
                        style={{
                            background: theme.card + 'cc', border: `1px solid ${theme.cardBorder}`,
                            borderRadius: 20, padding: '20px 16px', cursor: 'pointer',
                            textAlign: 'left', boxShadow: theme.shadowCard, fontFamily: 'Inter, sans-serif',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                            backdropFilter: 'blur(10px)',
                        }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = theme.shadow; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = theme.shadowCard; }}
                    >
                        <div style={{
                            width: 44, height: 44, borderRadius: 14,
                            background: c.color + '22', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 12,
                        }}>{c.emoji}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 3 }}>{c.label}</div>
                        <div style={{ fontSize: 12, color: theme.subtext }}>{c.sub}</div>
                    </button>
                ))}
            </div>

            <button id="logout-btn" onClick={onLogout}
                style={{
                    marginTop: 28, width: '100%', padding: '12px',
                    background: 'transparent', border: `1.5px solid ${theme.cardBorder}`,
                    borderRadius: 14, color: theme.subtext, fontSize: 14,
                    fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}>
                Log out
            </button>
        </div>
    );
}
