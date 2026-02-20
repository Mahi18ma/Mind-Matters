import React, { useEffect, useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Fallback keyword engine (runs when no API key) ──────────────────────────
const POS_WORDS = ['happy', 'joy', 'excited', 'grateful', 'love', 'wonderful', 'great', 'good', 'fantastic', 'amazing', 'peaceful', 'calm', 'hopeful', 'proud', 'energetic', 'motivated', 'cheerful', 'content', 'relieved', 'optimistic', 'blessed', 'thrilled', 'delighted', 'inspired', 'confident', 'refreshed', 'better', 'smile', 'fun', 'enjoy', 'nice', 'beautiful', 'strong', 'healthy', 'thankful', 'rest', 'relaxed', 'free', 'laugh', 'bright', 'warm'];
const NEG_WORDS = ['sad', 'anxious', 'stressed', 'worried', 'tired', 'exhausted', 'lonely', 'depressed', 'overwhelmed', 'afraid', 'angry', 'frustrated', 'upset', 'broken', 'numb', 'lost', 'hopeless', 'empty', 'heavy', 'dark', 'pain', 'hurt', 'cry', 'bad', 'terrible', 'awful', 'worst', 'hard', 'difficult', 'struggle', 'fear', 'dread', 'hate', 'alone', 'burned', 'cry', 'miss', 'scared', 'guilty', 'shame'];

function fallbackAnalyze(text) {
    const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
    const pos = words.filter(w => POS_WORDS.includes(w));
    const neg = words.filter(w => NEG_WORDS.includes(w));
    const score = pos.length - neg.length;
    const total = pos.length + neg.length;
    const pct = total === 0 ? 50 : Math.round((pos.length / total) * 100);

    let tone, color, support;
    if (score >= 3) { tone = 'Uplifting 🌟'; color = '#22c55e'; support = "You're in a wonderful headspace. Keep cherishing these positive feelings!"; }
    else if (score >= 1) { tone = 'Positive 🌤️'; color = '#84cc16'; support = "Things seem to be going well. Stay mindful of what's working for you."; }
    else if (score === 0) { tone = 'Balanced ⚖️'; color = '#eab308'; support = "A balanced day — neither highs nor lows. It's okay to just feel neutral."; }
    else if (score >= -2) { tone = 'Heavy 🌧️'; color = '#f97316'; support = "It sounds heavier today. Remember: it's okay to not be okay. One breath at a time. 💜"; }
    else { tone = 'Very Heavy ⛈️'; color = '#ef4444'; support = "These feelings are valid. You don't have to carry them alone. Be gentle with yourself today."; }

    return {
        tone, color, pct,
        emotions: [...new Set([...pos.slice(0, 3).map(w => `✓ ${w}`), ...neg.slice(0, 3).map(w => `• ${w}`)])],
        support,
        activities: ['🧘 Try 5 deep breaths', '📝 Keep writing', '🚶 Take a short walk'],
        isAI: false,
    };
}

// ─── Gemini prompt ────────────────────────────────────────────────────────────
async function geminiAnalyze(text, apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a compassionate mental health AI companion. Analyze this journal entry and respond ONLY with valid JSON (no markdown, no explanation):

Journal entry: "${text.slice(0, 1000)}"

Return exactly this JSON structure:
{
  "primaryEmotion": "one word emotion (e.g. Joyful, Anxious, Calm, Sad, Grateful)",
  "emotions": ["emoji + keyword1", "emoji + keyword2", "emoji + keyword3"],
  "intensity": "Low / Moderate / High",
  "tone": "Uplifting / Positive / Balanced / Heavy / Very Heavy",
  "toneEmoji": "matching emoji",
  "color": "hex color matching the tone (green for good, yellow for balanced, red for heavy)",
  "positivityPct": number between 0 and 100,
  "support": "2-3 sentence warm, non-clinical, empathetic message for this person right now",
  "activities": ["emoji + short activity1", "emoji + short activity2", "emoji + short activity3"]
}`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().replace(/```json|```/g, '').trim();
    return { ...JSON.parse(raw), isAI: true };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AIAnalysis({ text, theme }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const timerRef = useRef(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    useEffect(() => {
        if (text.trim().length < 12) { setResult(null); setError(''); return; }

        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            setLoading(true);
            setError('');
            try {
                let res;
                if (apiKey && apiKey !== 'paste-your-gemini-api-key-here') {
                    res = await geminiAnalyze(text, apiKey);
                } else {
                    res = fallbackAnalyze(text);
                }
                setResult(res);
            } catch (err) {
                // If Gemini fails (rate limit, etc.), fall back gracefully
                try { setResult(fallbackAnalyze(text)); }
                catch { setError('Analysis unavailable.'); }
            }
            setLoading(false);
        }, apiKey ? 900 : 500);

        return () => clearTimeout(timerRef.current);
    }, [text, apiKey]);

    if (text.trim().length < 12) return null;

    return (
        <div style={{
            background: theme.card,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: 20,
            padding: '18px',
            marginTop: 12,
            animation: 'fadeIn 0.4s ease',
            boxShadow: theme.shadowCard,
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: loading ? 10 : 14 }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                }}>🤖</div>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>AI Mood Analysis</div>
                    <div style={{ fontSize: 11, color: theme.subtext }}>
                        {result?.isAI ? '✨ Powered by Google Gemini' : '🔤 Keyword analysis'}
                    </div>
                </div>
                {result && !loading && (
                    <span style={{
                        marginLeft: 'auto', fontSize: 12, fontWeight: 700,
                        color: result.color || '#a855f7',
                        background: (result.color || '#a855f7') + '22',
                        padding: '4px 12px', borderRadius: 999,
                    }}>
                        {result.toneEmoji || ''} {result.tone}
                    </span>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: theme.accent,
                                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                            }} />
                        ))}
                    </div>
                    <span style={{ fontSize: 13, color: theme.subtext }}>
                        {apiKey ? 'Gemini is reading your entry…' : 'Analyzing your mood…'}
                    </span>
                </div>
            )}

            {/* Results */}
            {result && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* Primary Emotion + Intensity */}
                    {result.primaryEmotion && (
                        <div style={{ display: 'flex', gap: 10 }}>
                            <div style={{
                                flex: 1, background: theme.accentLight, borderRadius: 14,
                                padding: '12px', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 11, color: theme.tagText, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>Primary</div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>{result.primaryEmotion}</div>
                            </div>
                            {result.intensity && (
                                <div style={{
                                    flex: 1, background: theme.accentLight, borderRadius: 14,
                                    padding: '12px', textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: 11, color: theme.tagText, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>Intensity</div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>{result.intensity}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Positivity Bar */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: theme.subtext, marginBottom: 6 }}>
                            <span>😔 Heavy</span>
                            <span style={{ fontWeight: 700, color: theme.text }}>{result.positivityPct ?? result.pct}% uplifting</span>
                            <span>😊 Uplifting</span>
                        </div>
                        <div style={{ background: theme.inputBg, borderRadius: 999, height: 10, overflow: 'hidden' }}>
                            <div style={{
                                width: `${result.positivityPct ?? result.pct}%`, height: '100%',
                                background: `linear-gradient(90deg, #ef4444, #eab308, #22c55e)`,
                                borderRadius: 999, transition: 'width 0.8s ease',
                            }} />
                        </div>
                    </div>

                    {/* Emotion Keywords */}
                    {result.emotions?.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {result.emotions.map((e, i) => (
                                <span key={i} style={{
                                    background: theme.accentLight, color: theme.tagText,
                                    fontSize: 12, fontWeight: 600,
                                    padding: '5px 12px', borderRadius: 999,
                                    border: `1px solid ${theme.cardBorder}`,
                                }}>{e}</span>
                            ))}
                        </div>
                    )}

                    {/* Support Message */}
                    {result.support && (
                        <div style={{
                            background: `linear-gradient(135deg, ${(result.color || '#a855f7') + '15'}, ${(result.color || '#ec4899') + '10'})`,
                            border: `1px solid ${(result.color || '#a855f7') + '33'}`,
                            borderRadius: 14, padding: '14px 16px',
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: result.color || theme.accent, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                💜 For you, right now
                            </div>
                            <p style={{ fontSize: 13, color: theme.text, margin: 0, lineHeight: 1.65 }}>{result.support}</p>
                        </div>
                    )}

                    {/* Suggested Activities */}
                    {result.activities?.length > 0 && (
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: theme.subtext, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>Try these</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {result.activities.map((a, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        background: theme.card, border: `1px solid ${theme.cardBorder}`,
                                        borderRadius: 12, padding: '10px 14px',
                                        fontSize: 13, color: theme.text, fontWeight: 500,
                                    }}>{a}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {error && <div style={{ fontSize: 13, color: theme.subtext }}>{error}</div>}

            <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50%       { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
        </div>
    );
}
