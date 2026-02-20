import React, { useState, useEffect } from 'react';
import { MOODS } from '../constants/moods.js';
import { PROMPTS } from '../constants/prompts.js';
import { listenEntries, saveEntry, deleteEntry } from '../utils/db.js';
import AIAnalysis from './AIAnalysis.jsx';

export default function Journal({ theme, user }) {
    const [entries, setEntries] = useState([]);
    const [mood, setMood] = useState(null);
    const [text, setText] = useState('');
    const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    // Real-time listener (Firestore or localStorage)
    useEffect(() => {
        const unsub = listenEntries(user.uid, setEntries);
        return () => typeof unsub === 'function' && unsub();
    }, [user.uid]);

    const save = async () => {
        if (!mood && !text.trim()) return;
        setSaving(true);
        const entry = {
            mood: mood ? mood.emoji : '😐',
            moodLabel: mood ? mood.label : 'Okay',
            text: text.trim(),
            date: new Date().toISOString(),
        };
        await saveEntry(user.uid, entry);
        setMood(null);
        setText('');
        setSaved(true);
        setSaving(false);
        setTimeout(() => setSaved(false), 2500);
    };

    const remove = async (id) => {
        await deleteEntry(user.uid, id);
    };

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', padding: '24px 20px', maxWidth: 440, margin: '0 auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text, marginBottom: 6 }}>📓 Journal</h2>
            <p style={{ color: theme.subtext, fontSize: 14, marginBottom: 24 }}>Express yourself freely. No pressure.</p>

            {/* Prompt */}
            <div style={{
                background: theme.accentLight, border: `1px solid ${theme.cardBorder}`,
                borderRadius: 16, padding: '14px 18px', marginBottom: 20,
            }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: theme.tagText, marginBottom: 5, letterSpacing: 1, textTransform: 'uppercase' }}>Today's Prompt</div>
                <p style={{ fontSize: 14, color: theme.text, margin: 0, lineHeight: 1.55 }}>{prompt}</p>
            </div>

            {/* Mood Selector */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.subtext, marginBottom: 10 }}>How are you feeling?</div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {MOODS.map(m => (
                        <button key={m.emoji} id={`mood-${m.label.toLowerCase()}`} onClick={() => setMood(m)} title={m.label}
                            style={{
                                flex: 1, padding: '10px 4px', borderRadius: 14,
                                border: `2px solid ${mood?.emoji === m.emoji ? m.color : theme.cardBorder}`,
                                background: mood?.emoji === m.emoji ? m.color + '22' : theme.card,
                                cursor: 'pointer', fontSize: 22, textAlign: 'center',
                                transition: 'all 0.2s',
                                transform: mood?.emoji === m.emoji ? 'scale(1.1)' : 'scale(1)',
                            }}>{m.emoji}</button>
                    ))}
                </div>
                {mood && <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: theme.accent, fontWeight: 600 }}>Feeling {mood.label}</div>}
            </div>

            {/* Textarea */}
            <textarea id="journal-textarea" value={text} onChange={e => setText(e.target.value)}
                placeholder="Write anything... it stays just with you 💜"
                rows={5}
                style={{
                    width: '100%', padding: '14px 16px', borderRadius: 16,
                    border: `1.5px solid ${theme.inputBorder}`, background: theme.inputBg,
                    color: theme.text, fontSize: 15, fontFamily: 'Inter, sans-serif',
                    resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6,
                }}
                onFocus={e => e.target.style.borderColor = theme.accent}
                onBlur={e => e.target.style.borderColor = theme.inputBorder}
            />

            {/* AI Analysis */}
            <AIAnalysis text={text} theme={theme} />

            {/* Save */}
            <button id="journal-save" onClick={save} disabled={saving}
                style={{
                    width: '100%', marginTop: 14, padding: '15px',
                    background: saved ? theme.success : saving ? theme.subtext : theme.accentGrad,
                    border: 'none', borderRadius: 14, color: '#fff', fontSize: 15,
                    fontWeight: 700, cursor: saving ? 'wait' : 'pointer',
                    fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(168,85,247,0.3)',
                    transition: 'background 0.3s',
                }}>
                {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save Entry 💜'}
            </button>

            {/* Past Entries */}
            {entries.length > 0 && (
                <div style={{ marginTop: 32 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 14 }}>Past Entries</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {entries.map(e => (
                            <div key={e.id} style={{
                                background: theme.card, border: `1px solid ${theme.cardBorder}`,
                                borderRadius: 18, padding: '16px', boxShadow: theme.shadowCard,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <span style={{ fontSize: 22 }}>{e.mood}</span>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{e.moodLabel}</div>
                                        <div style={{ fontSize: 11, color: theme.subtext }}>
                                            {new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <button onClick={() => remove(e.id)} style={{
                                        marginLeft: 'auto', background: 'transparent', border: 'none',
                                        color: theme.subtext, cursor: 'pointer', fontSize: 16, padding: 4,
                                    }} title="Delete">🗑</button>
                                </div>
                                {e.text && <p style={{ fontSize: 14, color: theme.text, margin: 0, lineHeight: 1.55 }}>{e.text}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
