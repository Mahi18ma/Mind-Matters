import React, { useState } from 'react';

const slides = [
    {
        emoji: '🧠',
        tag: 'Mind Over Matter',
        title: 'Your mental health matters',
        body: "Opening up about mental struggles is hard. Existing self-care tools are often too complex or overwhelming. We built something simpler.",
    },
    {
        emoji: '⏰',
        tag: 'Feature 1',
        title: 'Break Reminders',
        body: "Smart reminders that gently nudge you to step away, breathe, and reset — without interrupting your flow.",
    },
    {
        emoji: '📓',
        tag: 'Feature 2',
        title: 'A Journal That Feels Safe',
        body: "A calming space to express yourself with guided prompts — no blank page anxiety, no pressure.",
    },
];

export default function Onboarding({ theme, onDone }) {
    const [slide, setSlide] = useState(0);
    const s = slides[slide];

    return (
        <div style={{
            minHeight: '100dvh',
            background: theme.bg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 20px',
            fontFamily: 'Inter, sans-serif',
        }}>
            <div style={{
                width: '100%',
                maxWidth: 400,
                background: theme.card,
                borderRadius: 28,
                padding: '40px 32px 36px',
                boxShadow: theme.shadow,
                border: `1px solid ${theme.cardBorder}`,
                textAlign: 'center',
            }}>
                {/* Emoji */}
                <div style={{
                    fontSize: 72,
                    marginBottom: 20,
                    animation: 'bounce 0.5s ease',
                }}>{s.emoji}</div>

                {/* Tag */}
                <div style={{
                    display: 'inline-block',
                    background: theme.tagBg,
                    color: theme.tagText,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 1,
                    padding: '4px 14px',
                    borderRadius: 999,
                    marginBottom: 16,
                    textTransform: 'uppercase',
                }}>{s.tag}</div>

                {/* Title */}
                <h1 style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: theme.text,
                    margin: '0 0 14px',
                    lineHeight: 1.3,
                }}>{s.title}</h1>

                {/* Body */}
                <p style={{
                    fontSize: 15,
                    color: theme.subtext,
                    lineHeight: 1.65,
                    margin: '0 0 32px',
                }}>{s.body}</p>

                {/* Dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
                    {slides.map((_, i) => (
                        <div key={i} onClick={() => setSlide(i)} style={{
                            width: i === slide ? 24 : 8,
                            height: 8,
                            borderRadius: 999,
                            background: i === slide ? theme.accent : theme.cardBorder,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }} />
                    ))}
                </div>

                {/* Button */}
                <button
                    id="onboarding-btn"
                    onClick={() => slide < slides.length - 1 ? setSlide(slide + 1) : onDone()}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: theme.accentGrad,
                        border: 'none',
                        borderRadius: 16,
                        color: '#fff',
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: 'pointer',
                        letterSpacing: 0.5,
                        boxShadow: '0 4px 16px rgba(168,85,247,0.35)',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseOver={e => e.target.style.transform = 'scale(1.03)'}
                    onMouseOut={e => e.target.style.transform = 'scale(1)'}
                >
                    {slide < slides.length - 1 ? 'Next →' : "Got it! Let's go 🚀"}
                </button>
            </div>

            <style>{`
        @keyframes bounce {
          0%,100% { transform: translateY(0); }
          40% { transform: translateY(-12px); }
        }
      `}</style>
        </div>
    );
}
