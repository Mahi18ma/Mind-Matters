import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

// Models served from public/models (downloaded locally — no CDN needed)
const MODEL_URL = '/models';

const EMOTION_COLORS = {
    happy: '#22c55e',
    neutral: '#94a3b8',
    sad: '#60a5fa',
    angry: '#ef4444',
    fearful: '#f97316',
    disgusted: '#a855f7',
    surprised: '#f59e0b',
};

const EMOTION_EMOJIS = {
    happy: '😄',
    neutral: '😐',
    sad: '😢',
    angry: '😠',
    fearful: '😨',
    disgusted: '🤢',
    surprised: '😲',
};

const EMOTION_MESSAGES = {
    happy: "You're glowing! 🌟 Your happiness is contagious.",
    neutral: "Nice and steady. A calm mind is a powerful mind.",
    sad: "It's okay to feel sad. Be gentle with yourself today 💜",
    angry: "Take a deep breath. You've got this. 🌬️",
    fearful: "Your feelings are valid. You're braver than you think.",
    disgusted: "Something bothering you? Your feelings are valid. 💙",
    surprised: "Surprised? Life is full of unexpected moments! ✨",
};

export default function FaceEmotion({ theme }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const intervalRef = useRef(null);
    const streamRef = useRef(null);

    const [status, setStatus] = useState('idle'); // idle | loading | ready | detecting | error
    const [emotions, setEmotions] = useState(null);
    const [dominant, setDominant] = useState(null);
    const [modelsOk, setModelsOk] = useState(false);
    const [history, setHistory] = useState([]); // last 5 dominant emotions

    // Load models on mount
    useEffect(() => {
        async function loadModels() {
            setStatus('loading');
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                ]);
                setModelsOk(true);
                setStatus('idle');
            } catch (err) {
                setStatus('error');
            }
        }
        loadModels();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        if (!modelsOk) return;
        setStatus('ready');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current.play();
                setStatus('detecting');
                startDetecting();
            };
        } catch {
            setStatus('error');
        }
    };

    const stopCamera = () => {
        clearInterval(intervalRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setStatus(modelsOk ? 'idle' : status);
        setEmotions(null);
        setDominant(null);
    };

    const startDetecting = () => {
        intervalRef.current = setInterval(async () => {
            if (!videoRef.current || videoRef.current.paused) return;
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 });
            const result = await faceapi
                .detectSingleFace(videoRef.current, options)
                .withFaceExpressions();

            if (result) {
                const exp = result.expressions;
                setEmotions(exp);
                const dom = Object.entries(exp).sort((a, b) => b[1] - a[1])[0];
                setDominant(dom[0]);
                setHistory(prev => [dom[0], ...prev].slice(0, 5));

                // Draw on canvas
                if (canvasRef.current && videoRef.current) {
                    const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
                    const resized = faceapi.resizeResults(result, dims);
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    // Draw detection box
                    faceapi.draw.drawDetections(canvasRef.current, resized);
                }
            } else {
                setDominant(null);
                setEmotions(null);
            }
        }, 500);
    };

    const isDetecting = status === 'detecting';
    const dominantColor = dominant ? EMOTION_COLORS[dominant] : theme.accent;

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', padding: '24px 20px', maxWidth: 440, margin: '0 auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text, marginBottom: 6 }}>
                😊 Face Emotion Detection
            </h2>
            <p style={{ color: theme.subtext, fontSize: 14, marginBottom: 24 }}>
                Real-time emotion reading from your camera — 100% private, processed on your device.
            </p>

            {/* Camera Card */}
            <div style={{
                background: theme.card,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: 24,
                overflow: 'hidden',
                marginBottom: 16,
                boxShadow: theme.shadow,
                position: 'relative',
            }}>
                {/* Video + Canvas overlay */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#0f0a1a' }}>
                    <video
                        ref={videoRef}
                        muted
                        playsInline
                        style={{
                            width: '100%', height: '100%',
                            objectFit: 'cover',
                            display: isDetecting ? 'block' : 'none',
                            transform: 'scaleX(-1)', // mirror
                        }}
                    />
                    <canvas
                        ref={canvasRef}
                        style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            display: isDetecting ? 'block' : 'none',
                            transform: 'scaleX(-1)',
                        }}
                    />

                    {/* Idle / Loading overlay */}
                    {!isDetecting && (
                        <div style={{
                            width: '100%', height: '100%',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            gap: 12,
                        }}>
                            {status === 'loading' && (
                                <>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} style={{
                                                width: 10, height: 10, borderRadius: '50%', background: theme.accent,
                                                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                                            }} />
                                        ))}
                                    </div>
                                    <span style={{ color: '#9ca3af', fontSize: 14 }}>Loading AI models…</span>
                                </>
                            )}
                            {status === 'error' && (
                                <>
                                    <div style={{ fontSize: 40 }}>⚠️</div>
                                    <span style={{ color: '#f87171', fontSize: 14, textAlign: 'center', padding: '0 20px' }}>
                                        Camera access denied or models failed to load.
                                    </span>
                                </>
                            )}
                            {(status === 'idle' || status === 'ready') && (
                                <>
                                    <div style={{ fontSize: 60 }}>📷</div>
                                    <span style={{ color: '#9ca3af', fontSize: 14 }}>Camera not started</span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Dominant emotion badge overlay */}
                    {isDetecting && dominant && (
                        <div style={{
                            position: 'absolute', top: 12, left: 12,
                            background: dominantColor + 'ee',
                            borderRadius: 999, padding: '6px 14px',
                            display: 'flex', alignItems: 'center', gap: 6,
                            backdropFilter: 'blur(8px)',
                            boxShadow: `0 4px 16px ${dominantColor}55`,
                        }}>
                            <span style={{ fontSize: 18 }}>{EMOTION_EMOJIS[dominant]}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>
                                {dominant}
                            </span>
                        </div>
                    )}

                    {/* No face detected */}
                    {isDetecting && !dominant && (
                        <div style={{
                            position: 'absolute', top: 12, left: 12,
                            background: 'rgba(0,0,0,0.6)', borderRadius: 999,
                            padding: '6px 14px', backdropFilter: 'blur(8px)',
                        }}>
                            <span style={{ fontSize: 12, color: '#d1d5db' }}>👤 No face detected</span>
                        </div>
                    )}
                </div>

                {/* Camera Controls */}
                <div style={{ padding: '14px 16px', display: 'flex', gap: 10 }}>
                    {!isDetecting ? (
                        <button
                            id="start-camera"
                            onClick={startCamera}
                            disabled={status === 'loading' || status === 'error'}
                            style={{
                                flex: 1, padding: '13px',
                                background: status === 'loading' || status === 'error' ? theme.subtext : theme.accentGrad,
                                border: 'none', borderRadius: 14, color: '#fff', fontSize: 15,
                                fontWeight: 700, cursor: status === 'loading' ? 'wait' : 'pointer',
                                fontFamily: 'Inter, sans-serif',
                                boxShadow: '0 4px 16px rgba(168,85,247,0.3)',
                            }}
                        >
                            {status === 'loading' ? 'Loading models…' : '📷 Start Camera'}
                        </button>
                    ) : (
                        <button
                            id="stop-camera"
                            onClick={stopCamera}
                            style={{
                                flex: 1, padding: '13px',
                                background: 'transparent', border: `1.5px solid ${theme.cardBorder}`,
                                borderRadius: 14, color: theme.subtext, fontSize: 15,
                                fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                            }}
                        >
                            ⏹ Stop Camera
                        </button>
                    )}
                </div>
            </div>

            {/* Support message */}
            {dominant && (
                <div style={{
                    background: dominantColor + '18',
                    border: `1px solid ${dominantColor + '44'}`,
                    borderRadius: 18, padding: '16px 18px', marginBottom: 16,
                    animation: 'fadeIn 0.4s ease',
                }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: dominantColor, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                        {EMOTION_EMOJIS[dominant]} How you're feeling
                    </div>
                    <p style={{ fontSize: 14, color: theme.text, margin: 0, lineHeight: 1.6 }}>
                        {EMOTION_MESSAGES[dominant]}
                    </p>
                </div>
            )}

            {/* Emotion Bars */}
            {emotions && (
                <div style={{
                    background: theme.card, border: `1px solid ${theme.cardBorder}`,
                    borderRadius: 20, padding: '18px', marginBottom: 16,
                    boxShadow: theme.shadowCard,
                }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 14 }}>
                        Emotion Breakdown
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {Object.entries(emotions)
                            .sort((a, b) => b[1] - a[1])
                            .map(([emotion, score]) => (
                                <div key={emotion} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 18, minWidth: 26 }}>{EMOTION_EMOJIS[emotion]}</span>
                                    <span style={{ fontSize: 12, color: theme.subtext, minWidth: 62, textTransform: 'capitalize' }}>
                                        {emotion}
                                    </span>
                                    <div style={{ flex: 1, background: theme.inputBg, borderRadius: 999, height: 8, overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${Math.round(score * 100)}%`, height: '100%',
                                            background: EMOTION_COLORS[emotion],
                                            borderRadius: 999,
                                            transition: 'width 0.4s ease',
                                            minWidth: score > 0.01 ? 6 : 0,
                                        }} />
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: theme.text, minWidth: 34, textAlign: 'right' }}>
                                        {Math.round(score * 100)}%
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Emotion History */}
            {history.length > 0 && (
                <div style={{
                    background: theme.card, border: `1px solid ${theme.cardBorder}`,
                    borderRadius: 20, padding: '16px 18px',
                    boxShadow: theme.shadowCard,
                }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 12 }}>
                        Recent Emotions
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {history.map((e, i) => (
                            <div key={i} style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                opacity: 1 - i * 0.15,
                            }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 12,
                                    background: EMOTION_COLORS[e] + '33',
                                    border: `2px solid ${EMOTION_COLORS[e]}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 20,
                                }}>
                                    {EMOTION_EMOJIS[e]}
                                </div>
                                <span style={{ fontSize: 9, color: theme.subtext, textTransform: 'capitalize' }}>{e}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Privacy note */}
            <p style={{ textAlign: 'center', fontSize: 11, color: theme.subtext, marginTop: 16, lineHeight: 1.5 }}>
                🔒 100% private — all processing happens on your device. No video is sent anywhere.
            </p>

            <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50%       { transform: scale(1.2); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
