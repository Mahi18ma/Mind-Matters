import React, { useState } from 'react';
import { PROMPTS } from '../constants/prompts.js';
import { MOODS } from '../constants/moods.js';
import { saveEntry } from '../utils/db.js';

export default function PromptScreen({ theme, user }) {
    const [idx, setIdx] = useState(() => Math.floor(Math.random() * PROMPTS.length));
    const [text, setText] = useState('');
    const [mood, setMood] = useState(null);
    const [saved, setSaved] = useState(false);

    const next = () => { setIdx(i => (i + 1) % PROMPTS.length); setText(''); setMood(null); setSaved(false); };

    const save = async () => {
        if (!text.trim() && !mood) return;
        await saveEntry(user.uid, {
            mood: mood ? mood.emoji : '😐',
            moodLabel: mood ? mood.label : 'Okay',
            text: `[Reflection] ${PROMPTS[idx]}\n\n${text.trim()}`,
            date: new Date().toISOString(),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', padding: '24px 20px', maxWidth: 440, margin: '0 auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text, marginBottom: 6 }}>💭 Daily Prompt</h2>
            <p style={{ color: theme.subtext, fontSize: 14, marginBottom: 24 }}>Take a moment to reflect on this question.</p>

            <div style={{
                background: theme.accentGrad, borderRadius: 24,
                padding: '32px 24px', marginBottom: 20,
                boxShadow: '0 8px 32px rgba(168,85,247,0.3)', textAlign: 'center',
            }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>💭</div>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', lineHeight: 1.55, margin: '0 0 20px' }}>{PROMPTS[idx]}</p>
                <button id="next-prompt" onClick={next} style={{
                    background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.4)',
                    color: '#fff', padding: '9px 20px', borderRadius: 999, cursor: 'pointer',
                    fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                }}>Next prompt ↻</button>
            </div>

            <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.subtext, marginBottom: 10 }}>How does this make you feel?</div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {MOODS.map(m => (
                        <button key={m.emoji} id={`prompt-mood-${m.label.toLowerCase()}`} onClick={() => setMood(m)} title={m.label}
                            style={{
                                flex: 1, padding: '10px 4px', borderRadius: 14,
                                border: `2px solid ${mood?.emoji === m.emoji ? m.color : theme.cardBorder}`,
                                background: mood?.emoji === m.emoji ? m.color + '22' : theme.card,
                                cursor: 'pointer', fontSize: 22, textAlign: 'center', transition: 'all 0.2s',
                                transform: mood?.emoji === m.emoji ? 'scale(1.1)' : 'scale(1)',
                            }}>{m.emoji}</button>
                    ))}
                </div>
            </div>

            <textarea id="prompt-textarea" value={text} onChange={e => setText(e.target.value)}
                placeholder="Write your reflection here..." rows={5}
                style={{
                    width: '100%', padding: '14px 16px', borderRadius: 16,
                    border: `1.5px solid ${theme.inputBorder}`, background: theme.inputBg,
                    color: theme.text, fontSize: 15, fontFamily: 'Inter, sans-serif',
                    resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6,
                }}
                onFocus={e => e.target.style.borderColor = theme.accent}
                onBlur={e => e.target.style.borderColor = theme.inputBorder}
            />

            <button id="prompt-save" onClick={save} style={{
                width: '100%', marginTop: 14, padding: '15px',
                background: saved ? theme.success : theme.accentGrad,
                border: 'none', borderRadius: 14, color: '#fff', fontSize: 15,
                fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                boxShadow: '0 4px 16px rgba(168,85,247,0.3)', transition: 'background 0.3s',
            }}>
                {saved ? '✓ Saved to Journal!' : 'Save Reflection 💜'}
            </button>
        </div>
    );
}
