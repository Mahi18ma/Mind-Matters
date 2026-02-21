import React, { useState, useEffect, useRef } from 'react';

// ── Breathing patterns ────────────────────────────────────────────────────────
const PATTERNS = [
    {
        id: 'calm',
        name: 'Calm Breath',
        emoji: '🌊',
        color: '#06b6d4',
        steps: [
            { label: 'Inhale', duration: 4 },
            { label: 'Exhale', duration: 6 },
        ],
        description: 'Simple 4-6 breath for any tense moment.',
    },
    {
        id: '478',
        name: '4-7-8 Breath',
        emoji: '🧘',
        color: '#a855f7',
        steps: [
            { label: 'Inhale', duration: 4 },
            { label: 'Hold', duration: 7 },
            { label: 'Exhale', duration: 8 },
        ],
        description: 'Relieves anxiety and helps you fall asleep.',
    },
    {
        id: 'box',
        name: 'Box Breathing',
        emoji: '🎯',
        color: '#10b981',
        steps: [
            { label: 'Inhale', duration: 4 },
            { label: 'Hold', duration: 4 },
            { label: 'Exhale', duration: 4 },
            { label: 'Hold', duration: 4 },
        ],
        description: 'Used by Navy SEALs to find calm focus.',
    },
];

const PHASE_COLOR = { Inhale: '#22c55e', Hold: '#f59e0b', Exhale: '#60a5fa' };
const PHASE_LABEL = { Inhale: 'Breathe in…', Hold: 'Hold…', Exhale: 'Breathe out…' };

// ── Main Component ────────────────────────────────────────────────────────────
export default function BreathingScreen({ theme }) {
    const [patternIdx, setPatternIdx] = useState(0);

    // Timer state — all managed by a single ref-based interval
    const [running, setRunning] = useState(false);
    const [stepIdx, setStepIdx] = useState(0);
    const [elapsed, setElapsed] = useState(0);   // seconds elapsed in current step
    const [cycles, setCycles] = useState(0);
    const [finished, setFinished] = useState(false);

    const intervalRef = useRef(null);
    const stateRef = useRef({ stepIdx: 0, elapsed: 0, cycles: 0 });

    const pattern = PATTERNS[patternIdx];
    const step = pattern.steps[stepIdx];
    const stepDur = step.duration;
    const pColor = PHASE_COLOR[step.label] || pattern.color;

    // ── Single interval master-clock ─────────────────────────────────────────
    const startClock = (pat) => {
        stateRef.current = { stepIdx: 0, elapsed: 0, cycles: 0 };
        setStepIdx(0);
        setElapsed(0);
        setCycles(0);
        setFinished(false);
        setRunning(true);

        intervalRef.current = setInterval(() => {
            const s = stateRef.current;
            const curPattern = pat;
            const curStep = curPattern.steps[s.stepIdx];

            const nextElapsed = s.elapsed + 1;

            if (nextElapsed >= curStep.duration) {
                // Advance to next step
                const nextStepIdx = (s.stepIdx + 1) % curPattern.steps.length;
                const nextCycles = nextStepIdx === 0 ? s.cycles + 1 : s.cycles;

                stateRef.current = { stepIdx: nextStepIdx, elapsed: 0, cycles: nextCycles };
                setStepIdx(nextStepIdx);
                setElapsed(0);
                setCycles(nextCycles);
            } else {
                stateRef.current = { ...s, elapsed: nextElapsed };
                setElapsed(nextElapsed);
            }
        }, 1000);
    };

    const stopClock = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setRunning(false);
        setStepIdx(0);
        setElapsed(0);
        setCycles(0);
        stateRef.current = { stepIdx: 0, elapsed: 0, cycles: 0 };
    };

    // Cleanup on unmount
    useEffect(() => () => clearInterval(intervalRef.current), []);

    // ── Derived values ────────────────────────────────────────────────────────
    const timeLeft = stepDur - elapsed;          // seconds left in this phase
    const phaseRatio = elapsed / stepDur;           // 0 → 1 within current phase

    // Overall cycle progress (for SVG ring)
    const totalCycleSecs = pattern.steps.reduce((a, s) => a + s.duration, 0);
    const secsIntoCycle = pattern.steps.slice(0, stepIdx).reduce((a, s) => a + s.duration, 0) + elapsed;
    const cycleProgress = running ? secsIntoCycle / totalCycleSecs : 0;

    // Circle geometry
    const R = 100;
    const CIRC = 2 * Math.PI * R;
    const strokeDashoffset = CIRC * (1 - cycleProgress);

    // Orb scale: Inhale → grow, Exhale → shrink, Hold → stay
    const orbScale = (() => {
        if (!running) return 1;
        if (step.label === 'Inhale') return 1 + phaseRatio * 0.4;       // 1 → 1.4
        if (step.label === 'Exhale') return 1.4 - phaseRatio * 0.4;     // 1.4 → 1
        return 1.4;                                                        // Hold stays big
    })();

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{ fontFamily: 'Inter, sans-serif', padding: '24px 20px', maxWidth: 440, margin: '0 auto' }}>

            {/* Header */}
            <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text, marginBottom: 4 }}>
                🧘 Breathing Exercise
            </h2>
            <p style={{ color: theme.subtext, fontSize: 14, marginBottom: 22 }}>
                Follow the rhythm. Let your mind settle.
            </p>

            {/* Pattern Picker — hidden while running */}
            {!running && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                    {PATTERNS.map((p, i) => (
                        <button
                            key={p.id}
                            id={`breath-pattern-${p.id}`}
                            onClick={() => setPatternIdx(i)}
                            style={{
                                flex: 1, minWidth: 100, padding: '12px 8px', borderRadius: 18,
                                border: `2px solid ${patternIdx === i ? p.color : theme.cardBorder}`,
                                background: patternIdx === i ? p.color + '22' : theme.card,
                                color: patternIdx === i ? p.color : theme.subtext,
                                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif', transition: 'all 0.25s',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <div style={{ fontSize: 22, marginBottom: 4 }}>{p.emoji}</div>
                            {p.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Pattern Info Card — hidden while running */}
            {!running && (
                <div style={{
                    background: pattern.color + '18',
                    border: `1px solid ${pattern.color}44`,
                    borderRadius: 14, padding: '12px 16px', marginBottom: 24,
                    fontSize: 13, color: theme.text, lineHeight: 1.6,
                }}>
                    <strong style={{ color: pattern.color }}>{pattern.name}:</strong>{' '}
                    {pattern.description}
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {pattern.steps.map((s, i) => (
                            <span key={i} style={{
                                background: (PHASE_COLOR[s.label] || pattern.color) + '22',
                                color: PHASE_COLOR[s.label] || pattern.color,
                                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                            }}>
                                {s.label} {s.duration}s
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Breathing Circle ─────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ position: 'relative', width: 260, height: 260 }}>

                    {/* SVG progress ring */}
                    <svg
                        width={260} height={260} viewBox="0 0 260 260"
                        style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
                    >
                        {/* Track */}
                        <circle
                            cx={130} cy={130} r={R}
                            fill="none"
                            stroke={theme.cardBorder}
                            strokeWidth={14}
                        />
                        {/* Progress arc */}
                        <circle
                            cx={130} cy={130} r={R}
                            fill="none"
                            stroke={running ? pColor : pattern.color}
                            strokeWidth={14}
                            strokeLinecap="round"
                            strokeDasharray={CIRC}
                            strokeDashoffset={strokeDashoffset}
                            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.6s ease' }}
                        />
                    </svg>

                    {/* Pulsing orb — scale driven by elapsed/duration math, no CSS transitions on scale */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div style={{
                            width: 160,
                            height: 160,
                            borderRadius: '50%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            // Smooth scale via CSS transition — duration is always 1s so it stays silky
                            transform: `scale(${orbScale})`,
                            transition: 'transform 1s ease-in-out',
                            background: running
                                ? `radial-gradient(circle at 50% 50%, ${pColor}55 0%, ${pColor}22 55%, transparent 100%)`
                                : `radial-gradient(circle at 50% 50%, ${pattern.color}33 0%, ${pattern.color}11 65%, transparent 100%)`,
                            // Background colour transition separate from scale
                            // We use a box-shadow glow instead so background can transition cleanly
                            boxShadow: running
                                ? `0 0 ${30 + orbScale * 20}px ${pColor}55`
                                : `0 0 30px ${pattern.color}22`,
                        }}>
                            {running ? (
                                <>
                                    <div style={{
                                        fontSize: 11, fontWeight: 800, letterSpacing: 1.5,
                                        textTransform: 'uppercase', color: pColor, marginBottom: 4,
                                    }}>
                                        {step.label}
                                    </div>
                                    <div style={{
                                        fontSize: 44, fontWeight: 900, color: theme.text,
                                        lineHeight: 1, letterSpacing: -2,
                                    }}>
                                        {timeLeft}
                                    </div>
                                    <div style={{ fontSize: 11, color: theme.subtext, marginTop: 4 }}>
                                        {PHASE_LABEL[step.label]}
                                    </div>
                                </>
                            ) : (
                                <div style={{ fontSize: 50 }}>{pattern.emoji}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cycle counter */}
            {running && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <span style={{
                        background: pattern.color + '22', color: pattern.color,
                        padding: '6px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700,
                    }}>
                        🔄 {cycles} cycle{cycles !== 1 ? 's' : ''} complete
                    </span>
                </div>
            )}

            {/* Controls */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                {!running ? (
                    <button
                        id="breath-start"
                        onClick={() => startClock(pattern)}
                        style={{
                            flex: 1, padding: '16px', borderRadius: 16,
                            background: `linear-gradient(135deg, ${pattern.color}, ${pattern.color}cc)`,
                            border: 'none', color: '#fff', fontSize: 16, fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                            boxShadow: `0 6px 24px ${pattern.color}55`,
                            transition: 'transform 0.15s, box-shadow 0.15s',
                        }}
                    >
                        {pattern.emoji} Begin
                    </button>
                ) : (
                    <button
                        id="breath-stop"
                        onClick={stopClock}
                        style={{
                            flex: 1, padding: '16px', borderRadius: 16,
                            background: 'transparent',
                            border: `1.5px solid ${theme.cardBorder}`,
                            color: theme.subtext, fontSize: 15, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                            transition: 'all 0.2s',
                        }}
                    >
                        ⏹ End Session
                    </button>
                )}
            </div>

            {/* Step guide — always visible, highlights active step */}
            <div style={{
                background: theme.card,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: 20, padding: '18px',
                backdropFilter: 'blur(10px)',
            }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 12 }}>
                    How it works
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pattern.steps.map((s, i) => {
                        const isActive = running && stepIdx === i;
                        const c = PHASE_COLOR[s.label] || pattern.color;
                        return (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 14px', borderRadius: 12,
                                background: isActive ? c + '18' : 'transparent',
                                border: `1px solid ${isActive ? c + '55' : 'transparent'}`,
                                transition: 'all 0.35s ease',
                            }}>
                                <div style={{
                                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                    background: c + '22',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 14, fontWeight: 800, color: c,
                                }}>
                                    {i + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>
                                        {s.label}
                                    </div>
                                    <div style={{ fontSize: 11, color: theme.subtext }}>
                                        {s.duration} seconds
                                    </div>
                                </div>
                                {isActive && (
                                    <div style={{
                                        width: 8, height: 8, borderRadius: '50%', background: c,
                                        animation: 'bPulse 1.2s ease-in-out infinite',
                                    }} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
        @keyframes bPulse {
          0%, 100% { transform: scale(0.7); opacity: 0.4; }
          50%       { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
        </div>
    );
}
