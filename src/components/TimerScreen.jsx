import React, { useState, useEffect, useRef } from 'react';

const PRESETS = [5, 10, 15, 25, 45, 60];

const BREAK_IDEAS = [
    '🚶 Take a short walk outside',
    '💧 Drink a glass of water',
    '🧘 Try 4-7-8 breathing',
    '👀 Look at something 20 feet away',
    '🤸 Stretch your neck and shoulders',
    '☀️ Step outside for fresh air',
    '😊 Text a friend something kind',
    '🎵 Listen to your favourite song',
];

export default function TimerScreen({ theme }) {
    const [duration, setDuration] = useState(10); // minutes
    const [left, setLeft] = useState(null); // seconds remaining
    const [running, setRunning] = useState(false);
    const [done, setDone] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (running && left > 0) {
            intervalRef.current = setInterval(() => setLeft(l => l - 1), 1000);
        } else if (left === 0 && running) {
            setRunning(false);
            setDone(true);
        }
        return () => clearInterval(intervalRef.current);
    }, [running, left]);

    const start = () => {
        setLeft(duration * 60);
        setRunning(true);
        setDone(false);
    };

    const pause = () => { setRunning(false); clearInterval(intervalRef.current); };
    const resume = () => setRunning(true);
    const reset = () => { setRunning(false); setLeft(null); setDone(false); };

    const total = duration * 60;
    const progress = left != null ? (total - left) / total : 0;
    const radius = 90;
    const circ = 2 * Math.PI * radius;
    const dash = circ * (1 - progress);

    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', padding: '24px 20px', maxWidth: 440, margin: '0 auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text, marginBottom: 6 }}>⏰ Break Timer</h2>
            <p style={{ color: theme.subtext, fontSize: 14, marginBottom: 24 }}>Step away, breathe, and reset.</p>

            {/* Duration Picker */}
            {!running && left === null && (
                <>
                    <div style={{ fontSize: 13, fontWeight: 600, color: theme.subtext, marginBottom: 12 }}>Choose duration</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                        {PRESETS.map(p => (
                            <button
                                key={p}
                                id={`preset-${p}`}
                                onClick={() => setDuration(p)}
                                style={{
                                    padding: '9px 18px',
                                    borderRadius: 999,
                                    border: `2px solid ${duration === p ? theme.accent : theme.cardBorder}`,
                                    background: duration === p ? theme.accentLight : theme.card,
                                    color: duration === p ? theme.accent : theme.subtext,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    cursor: 'pointer',
                                    fontFamily: 'Inter, sans-serif',
                                    transition: 'all 0.2s',
                                }}
                            >{p} min</button>
                        ))}
                    </div>

                    {/* Custom slider */}
                    <div style={{ marginBottom: 28 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: theme.subtext, marginBottom: 10 }}>
                            Custom: <span style={{ color: theme.accent }}>{duration} min</span>
                        </div>
                        <input
                            id="custom-duration"
                            type="range"
                            min={1}
                            max={90}
                            value={duration}
                            onChange={e => setDuration(Number(e.target.value))}
                            style={{ width: '100%', accentColor: theme.accent }}
                        />
                    </div>
                </>
            )}

            {/* Ring */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                <div style={{ position: 'relative', width: 220, height: 220 }}>
                    <svg width={220} height={220} viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx={110} cy={110} r={radius} fill="none" stroke={theme.cardBorder} strokeWidth={14} />
                        <circle
                            cx={110} cy={110} r={radius}
                            fill="none"
                            stroke={done ? theme.success : theme.accent}
                            strokeWidth={14}
                            strokeDasharray={circ}
                            strokeDashoffset={dash}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {done ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 40 }}>🎉</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: theme.success }}>Break done!</div>
                            </div>
                        ) : (
                            <>
                                <div style={{ fontSize: 40, fontWeight: 800, color: theme.text, letterSpacing: -1 }}>
                                    {left != null ? fmt(left) : `${duration}:00`}
                                </div>
                                <div style={{ fontSize: 13, color: theme.subtext }}>
                                    {running ? 'Breathe...' : left != null ? 'Paused' : 'Ready'}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                {left === null && !done ? (
                    <button id="timer-start" onClick={start} style={btnStyle(theme.accentGrad, '#fff', theme)}>
                        Start Break ▶
                    </button>
                ) : done ? (
                    <button id="timer-reset" onClick={reset} style={btnStyle(theme.accentGrad, '#fff', theme)}>
                        New Break 🔄
                    </button>
                ) : (
                    <>
                        <button id="timer-pause-resume" onClick={running ? pause : resume}
                            style={btnStyle(running ? '#6b7280' : theme.accentGrad, '#fff', theme, 0.6)}>
                            {running ? '⏸ Pause' : '▶ Resume'}
                        </button>
                        <button id="timer-stop" onClick={reset}
                            style={btnStyle('transparent', theme.subtext, theme, 0.4, `1.5px solid ${theme.cardBorder}`)}>
                            Stop ✕
                        </button>
                    </>
                )}
            </div>

            {/* Break Ideas */}
            <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 20, padding: '18px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 12 }}>Break Ideas 💡</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {BREAK_IDEAS.map((idea, i) => (
                        <div key={i} style={{ fontSize: 13, color: theme.subtext, lineHeight: 1.5 }}>{idea}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function btnStyle(bg, color, theme, flex = 1, border = 'none') {
    return {
        flex,
        padding: '15px',
        background: bg,
        border,
        borderRadius: 14,
        color,
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        boxShadow: bg.includes('gradient') ? '0 4px 16px rgba(168,85,247,0.3)' : 'none',
    };
}
