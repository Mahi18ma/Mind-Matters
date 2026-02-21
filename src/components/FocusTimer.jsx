import React, { useState, useEffect, useRef } from 'react';

const MODES = [
    { id: 'pomodoro', label: 'Pomodoro', emoji: '🍅', work: 25, rest: 5, color: '#ef4444', desc: '25 min focus, 5 min break' },
    { id: 'deep', label: 'Deep Work', emoji: '🧠', work: 50, rest: 10, color: '#a855f7', desc: '50 min focus, 10 min break' },
    { id: 'short', label: 'Quick Win', emoji: '⚡', work: 15, rest: 3, color: '#f59e0b', desc: '15 min sprint, 3 min break' },
    { id: 'custom', label: 'Custom', emoji: '🎛️', work: 30, rest: 5, color: '#06b6d4', desc: 'Set your own duration' },
];

const FOCUS_TIPS = [
    '📵 Put your phone face-down',
    '🎧 Use noise-cancelling headphones',
    '💧 Keep water nearby',
    '✅ Pick ONE task before starting',
    '🌡️ Keep the room slightly cool',
    '🚪 Close unnecessary browser tabs',
];

export default function FocusTimer({ theme }) {
    const [modeIdx, setModeIdx] = useState(0);
    const [phase, setPhase] = useState('work'); // 'work' | 'rest'
    const [running, setRunning] = useState(false);
    const [done, setDone] = useState(false);
    const [left, setLeft] = useState(null);
    const [sessions, setSessions] = useState(0);
    const [customWork, setCustomWork] = useState(30);
    const [customRest, setCustomRest] = useState(5);
    const tickRef = useRef(null);

    const mode = MODES[modeIdx];
    const workMins = mode.id === 'custom' ? customWork : mode.work;
    const restMins = mode.id === 'custom' ? customRest : mode.rest;
    const totalSecs = (phase === 'work' ? workMins : restMins) * 60;

    useEffect(() => {
        if (running && left > 0) {
            tickRef.current = setInterval(() => setLeft(l => l - 1), 1000);
        } else if (left === 0 && running) {
            clearInterval(tickRef.current);
            if (phase === 'work') {
                setSessions(s => s + 1);
                setPhase('rest');
                setLeft(restMins * 60);
            } else {
                setPhase('work');
                setLeft(workMins * 60);
            }
        }
        return () => clearInterval(tickRef.current);
    }, [running, left, phase, workMins, restMins]);

    const start = () => {
        setLeft(totalSecs);
        setRunning(true);
        setDone(false);
        setPhase('work');
    };
    const pause = () => { clearInterval(tickRef.current); setRunning(false); };
    const resume = () => setRunning(true);
    const reset = () => { clearInterval(tickRef.current); setRunning(false); setLeft(null); setDone(false); setPhase('work'); setSessions(0); };

    const progress = left != null ? (totalSecs - left) / totalSecs : 0;
    const R = 95;
    const CIRC = 2 * Math.PI * R;
    const dash = CIRC * (1 - progress);
    const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    const colour = phase === 'work' ? mode.color : '#22c55e';

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', padding: '24px 20px', maxWidth: 440, margin: '0 auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text, marginBottom: 4 }}>🎯 Focus Mode</h2>
            <p style={{ color: theme.subtext, fontSize: 14, marginBottom: 22 }}>Deep work. No distractions. Just you.</p>

            {/* Mode Selector */}
            {!running && left === null && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                        {MODES.map((m, i) => (
                            <button key={m.id} id={`focus-mode-${m.id}`} onClick={() => setModeIdx(i)}
                                style={{
                                    padding: '14px 12px', borderRadius: 18, cursor: 'pointer',
                                    border: `2px solid ${modeIdx === i ? m.color : theme.cardBorder}`,
                                    background: modeIdx === i ? m.color + '18' : theme.card,
                                    fontFamily: 'Inter, sans-serif', textAlign: 'left',
                                    transition: 'all 0.25s', backdropFilter: 'blur(8px)',
                                }}>
                                <div style={{ fontSize: 22, marginBottom: 4 }}>{m.emoji}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: modeIdx === i ? m.color : theme.text }}>{m.label}</div>
                                <div style={{ fontSize: 11, color: theme.subtext, marginTop: 2 }}>{m.desc}</div>
                            </button>
                        ))}
                    </div>

                    {/* Custom inputs */}
                    {mode.id === 'custom' && (
                        <div style={{
                            background: mode.color + '12', border: `1px solid ${mode.color + '33'}`,
                            borderRadius: 16, padding: '16px', marginBottom: 20,
                        }}>
                            <div style={{ display: 'flex', gap: 16 }}>
                                {[{ label: 'Focus', val: customWork, set: setCustomWork, max: 120 },
                                { label: 'Break', val: customRest, set: setCustomRest, max: 30 }].map(f => (
                                    <div key={f.label} style={{ flex: 1 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: theme.subtext, marginBottom: 6 }}>
                                            {f.label}: <span style={{ color: mode.color }}>{f.val} min</span>
                                        </div>
                                        <input type="range" min={1} max={f.max} value={f.val}
                                            onChange={e => f.set(Number(e.target.value))}
                                            style={{ width: '100%', accentColor: mode.color }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Session badges */}
            {sessions > 0 && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
                    {Array.from({ length: sessions }).map((_, i) => (
                        <span key={i} style={{
                            background: mode.color + '33', color: mode.color,
                            borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 700,
                        }}>✓ Session {i + 1}</span>
                    ))}
                </div>
            )}

            {/* Ring */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ position: 'relative', width: 230, height: 230 }}>
                    <svg width={230} height={230} viewBox="0 0 230 230" style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
                        <circle cx={115} cy={115} r={R} fill="none" stroke={theme.cardBorder} strokeWidth={14} />
                        <circle cx={115} cy={115} r={R} fill="none"
                            stroke={colour} strokeWidth={14}
                            strokeDasharray={CIRC} strokeDashoffset={dash} strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.6s ease' }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {left != null ? (
                            <>
                                <div style={{
                                    fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
                                    color: colour, marginBottom: 4,
                                }}>{phase === 'work' ? '⚡ Focus' : '☕ Rest'}</div>
                                <div style={{ fontSize: 44, fontWeight: 900, color: theme.text, letterSpacing: -2 }}>{fmt(left)}</div>
                                <div style={{ fontSize: 12, color: theme.subtext }}>
                                    {running ? (phase === 'work' ? 'Stay locked in' : 'Recharge') : 'Paused'}
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: 46 }}>{mode.emoji}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{workMins}:{String(restMins).padStart(2, '0')}</div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                {left === null ? (
                    <button id="focus-start" onClick={start} style={btnS(`linear-gradient(135deg, ${mode.color}, ${mode.color}cc)`, '#fff', theme)}>
                        {mode.emoji} Start Focus
                    </button>
                ) : (
                    <>
                        <button id="focus-pause-resume" onClick={running ? pause : resume}
                            style={btnS(running ? '#6b7280' : `linear-gradient(135deg,${mode.color},${mode.color}cc)`, '#fff', theme, 0.7)}>
                            {running ? '⏸ Pause' : '▶ Resume'}
                        </button>
                        <button id="focus-reset" onClick={reset}
                            style={btnS('transparent', theme.subtext, theme, 0.3, `1.5px solid ${theme.cardBorder}`)}>
                            Reset
                        </button>
                    </>
                )}
            </div>

            {/* Tips */}
            <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 20, padding: '18px', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 12 }}>💡 Focus Tips</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {FOCUS_TIPS.map((tip, i) => (
                        <div key={i} style={{ fontSize: 13, color: theme.subtext, lineHeight: 1.5 }}>{tip}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function btnS(bg, color, theme, flex = 1, border = 'none') {
    return {
        flex, padding: '15px', background: bg, border, borderRadius: 14, color,
        fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        boxShadow: bg.includes('gradient') ? '0 4px 20px rgba(168,85,247,0.3)' : 'none',
        transition: 'transform 0.15s, opacity 0.15s',
    };
}
