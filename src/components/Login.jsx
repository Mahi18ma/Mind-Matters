import React, { useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signInAnonymously,
} from 'firebase/auth';
import { auth, FIREBASE_CONFIGURED } from '../firebase.js';
import { storage } from '../utils/storage.js';

export default function Login({ theme, onLogin }) {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const inputStyle = {
        width: '100%', padding: '13px 16px', borderRadius: 12,
        border: `1.5px solid ${theme.inputBorder}`, background: theme.inputBg,
        color: theme.text, fontSize: 15, fontFamily: 'Inter, sans-serif',
        outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!FIREBASE_CONFIGURED) {
            // Fallback: localStorage auth (same as before)
            const users = storage.get('mom_users', {});
            if (mode === 'signup') {
                if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
                if (email.length < 4) { setError('Enter a valid email.'); setLoading(false); return; }
                if (pass.length < 6) { setError('Password must be 6+ characters.'); setLoading(false); return; }
                if (users[email]) { setError('Account already exists. Please log in.'); setLoading(false); return; }
                users[email] = { name: name.trim(), pass };
                storage.set('mom_users', users);
                onLogin({ email, name: name.trim(), uid: email });
            } else {
                if (!users[email]) { setError('Account not found. Sign up first!'); setLoading(false); return; }
                if (users[email].pass !== pass) { setError('Wrong password.'); setLoading(false); return; }
                onLogin({ email, name: users[email].name, uid: email });
            }
            setLoading(false);
            return;
        }

        try {
            if (mode === 'signup') {
                if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
                const cred = await createUserWithEmailAndPassword(auth, email, pass);
                await updateProfile(cred.user, { displayName: name.trim() });
                onLogin({ email, name: name.trim(), uid: cred.user.uid });
            } else {
                const cred = await signInWithEmailAndPassword(auth, email, pass);
                onLogin({ email, name: cred.user.displayName || 'Friend', uid: cred.user.uid });
            }
        } catch (err) {
            const msgs = {
                'auth/email-already-in-use': 'Account already exists. Try logging in.',
                'auth/user-not-found': 'No account found. Sign up first!',
                'auth/wrong-password': 'Wrong password. Try again.',
                'auth/invalid-email': 'Please enter a valid email.',
                'auth/weak-password': 'Password must be at least 6 characters.',
                'auth/too-many-requests': 'Too many attempts. Try again later.',
                'auth/invalid-credential': 'Wrong email or password. Try again.',
            };
            setError(msgs[err.code] || err.message);
        }
        setLoading(false);
    };

    const handleGuest = async () => {
        setLoading(true);
        if (FIREBASE_CONFIGURED) {
            try {
                const cred = await signInAnonymously(auth);
                onLogin({ email: 'guest', name: 'Friend', uid: cred.user.uid });
            } catch (err) {
                // Firebase Anonymous auth may need enabling — fallback
                onLogin({ email: 'guest', name: 'Friend', uid: 'guest' });
            }
        } else {
            onLogin({ email: 'guest', name: 'Friend', uid: 'guest' });
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100dvh', background: 'transparent',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '24px 20px', fontFamily: 'Inter, sans-serif',
        }}>
            <div style={{
                width: '100%', maxWidth: 400,
                background: theme.card + 'ee',
                borderRadius: 28, padding: '40px 32px 36px',
                boxShadow: theme.shadow, border: `1px solid ${theme.cardBorder}`,
                backdropFilter: 'blur(20px)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 52, marginBottom: 12 }}>🧠</div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.text, margin: '0 0 6px' }}>
                        {mode === 'login' ? 'Welcome back 👋' : 'Create account ✨'}
                    </h1>
                    <p style={{ color: theme.subtext, fontSize: 14, margin: 0 }}>
                        {FIREBASE_CONFIGURED
                            ? mode === 'login' ? 'Your safe space is waiting.' : "Let's start your journey."
                            : '⚠️ Firebase not configured — using local storage'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {mode === 'signup' && (
                        <input id="signup-name" style={inputStyle} type="text" placeholder="Your first name"
                            value={name} onChange={e => setName(e.target.value)}
                            onFocus={e => e.target.style.borderColor = theme.accent}
                            onBlur={e => e.target.style.borderColor = theme.inputBorder} />
                    )}
                    <input id="login-email" style={inputStyle} type="email" placeholder="Email address"
                        value={email} onChange={e => setEmail(e.target.value)}
                        onFocus={e => e.target.style.borderColor = theme.accent}
                        onBlur={e => e.target.style.borderColor = theme.inputBorder} />
                    <input id="login-pass" style={inputStyle} type="password" placeholder="Password"
                        value={pass} onChange={e => setPass(e.target.value)}
                        onFocus={e => e.target.style.borderColor = theme.accent}
                        onBlur={e => e.target.style.borderColor = theme.inputBorder} />

                    {error && (
                        <div style={{ background: '#fff0f0', border: '1px solid #fecaca', color: theme.danger, fontSize: 13, padding: '10px 14px', borderRadius: 10 }}>
                            {error}
                        </div>
                    )}

                    <button id="auth-submit" type="submit" disabled={loading} style={{
                        padding: '15px', background: loading ? theme.subtext : theme.accentGrad,
                        border: 'none', borderRadius: 14, color: '#fff', fontSize: 15,
                        fontWeight: 700, cursor: loading ? 'wait' : 'pointer', marginTop: 4,
                        boxShadow: '0 4px 16px rgba(168,85,247,0.3)', fontFamily: 'Inter, sans-serif',
                    }}>
                        {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
                    </button>

                    <button id="guest-mode" type="button" onClick={handleGuest} disabled={loading} style={{
                        padding: '13px', background: 'transparent',
                        border: `1.5px solid ${theme.cardBorder}`, borderRadius: 14,
                        color: theme.subtext, fontSize: 14, fontWeight: 500,
                        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}>
                        Continue as Guest 👤
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: theme.subtext }}>
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <span id="toggle-auth-mode"
                        onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                        style={{ color: theme.accent, fontWeight: 600, cursor: 'pointer' }}>
                        {mode === 'login' ? 'Sign up' : 'Log in'}
                    </span>
                </p>
            </div>
        </div>
    );
}
