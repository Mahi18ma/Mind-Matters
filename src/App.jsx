import React, { useState, useEffect } from 'react';
import { LIGHT, DARK } from './constants/themes.js';
import { storage } from './utils/storage.js';
import { auth, FIREBASE_CONFIGURED } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Onboarding from './components/Onboarding.jsx';
import Login from './components/Login.jsx';
import Home from './components/Home.jsx';
import Journal from './components/Journal.jsx';
import TimerScreen from './components/TimerScreen.jsx';
import GraphScreen from './components/GraphScreen.jsx';
import PromptScreen from './components/PromptScreen.jsx';
import CalendarView from './components/CalendarView.jsx';
import BreathingScreen from './components/BreathingScreen.jsx';
import FocusTimer from './components/FocusTimer.jsx';
import AffirmationsScreen from './components/AffirmationsScreen.jsx';
import QuotesScreen from './components/QuotesScreen.jsx';
import { listenEntries } from './utils/db.js';

const NAV = [
    { id: 'tab-home', screen: 'home', emoji: '🏠', label: 'Home' },
    { id: 'tab-journal', screen: 'journal', emoji: '📓', label: 'Journal' },
    { id: 'tab-breathe', screen: 'breathe', emoji: '🧘', label: 'Breathe' },
    { id: 'tab-focus', screen: 'focus', emoji: '🎯', label: 'Focus' },
    { id: 'tab-timer', screen: 'timer', emoji: '⏰', label: 'Timer' },
    { id: 'tab-affirm', screen: 'affirm', emoji: '🌟', label: 'Affirm' },
    { id: 'tab-quotes', screen: 'quotes', emoji: '✨', label: 'Quotes' },
    { id: 'tab-calendar', screen: 'calendar', emoji: '📅', label: 'Calendar' },
    { id: 'tab-graph', screen: 'graph', emoji: '📊', label: 'Stats' },
];

export default function App() {
    const [dark, setDark] = useState(() => storage.get('mom_dark', false));
    const [seen, setSeen] = useState(() => storage.get('mom_seen', false));
    const [user, setUser] = useState(() => storage.get('mom_user', null));
    const [screen, setScreen] = useState('home');
    const [calEntries, setCalEntries] = useState([]);

    const theme = dark ? DARK : LIGHT;

    useEffect(() => { storage.set('mom_dark', dark); }, [dark]);

    // Firebase auth state persistence
    useEffect(() => {
        if (!FIREBASE_CONFIGURED) return;
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const saved = storage.get('mom_user', null);
                if (saved && saved.uid === firebaseUser.uid) {
                    setUser(saved);
                } else {
                    const u = { email: firebaseUser.email || 'guest', name: firebaseUser.displayName || 'Friend', uid: firebaseUser.uid };
                    setUser(u);
                    storage.set('mom_user', u);
                }
            } else {
                setUser(null);
                storage.remove('mom_user');
            }
        });
        return () => unsub();
    }, []);

    // Load entries for calendar (available globally when logged in)
    useEffect(() => {
        if (!user) return;
        const unsub = listenEntries(user.uid, setCalEntries);
        return () => typeof unsub === 'function' && unsub();
    }, [user?.uid]);

    const handleLogin = (u) => { setUser(u); storage.set('mom_user', u); setScreen('home'); };
    const handleLogout = async () => {
        if (FIREBASE_CONFIGURED && auth) {
            try { await signOut(auth); } catch { }
        }
        setUser(null);
        storage.remove('mom_user');
        setScreen('home');
    };

    // ── Animated Background Orbs ─────────────────────────────
    const orbs = (
        <div className="orb-container" aria-hidden="true">
            <div className={`orb orb-1 ${dark ? 'orb-dark' : ''}`} />
            <div className={`orb orb-2 ${dark ? 'orb-dark' : ''}`} />
            <div className={`orb orb-3 ${dark ? 'orb-dark' : ''}`} />
            <div className={`orb orb-4 ${dark ? 'orb-dark' : ''}`} />
            <div className={`orb orb-5 ${dark ? 'orb-dark' : ''}`} />
        </div>
    );

    // ── Onboarding ───────────────────────────────────────────
    if (!seen) return (
        <div style={{ background: theme.bg, minHeight: '100dvh', position: 'relative', overflow: 'hidden' }}>
            {orbs}
            <DarkToggle dark={dark} setDark={setDark} theme={theme} />
            <Onboarding theme={theme} onDone={() => { setSeen(true); storage.set('mom_seen', true); }} />
        </div>
    );

    // ── Auth ─────────────────────────────────────────────────
    if (!user) return (
        <div style={{ background: theme.bg, minHeight: '100dvh', position: 'relative', overflow: 'hidden' }}>
            {orbs}
            <DarkToggle dark={dark} setDark={setDark} theme={theme} />
            <Login theme={theme} onLogin={handleLogin} />
        </div>
    );

    // ── Main App ─────────────────────────────────────────────
    const renderScreen = () => {
        switch (screen) {
            case 'home': return <Home theme={theme} user={user} onNav={setScreen} onLogout={handleLogout} />;
            case 'journal': return <Journal theme={theme} user={user} />;
            case 'timer': return <TimerScreen theme={theme} />;
            case 'graph': return <GraphScreen theme={theme} user={user} />;
            case 'prompt': return <PromptScreen theme={theme} user={user} />;
            case 'calendar': return <CalendarView theme={theme} entries={calEntries} />;
            case 'breathe': return <BreathingScreen theme={theme} />;
            case 'focus': return <FocusTimer theme={theme} />;
            case 'affirm': return <AffirmationsScreen theme={theme} />;
            case 'quotes': return <QuotesScreen theme={theme} />;
            default: return <Home theme={theme} user={user} onNav={setScreen} onLogout={handleLogout} />;
        }
    };

    return (
        <div style={{ background: theme.bg, minHeight: '100dvh', maxWidth: 480, margin: '0 auto', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
            {orbs}

            {/* Top Bar */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: theme.navBg + 'cc', borderBottom: `1px solid ${theme.navBorder}`,
                padding: '12px 20px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', backdropFilter: 'blur(16px)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🧠</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>Mind Over Matter</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: theme.subtext }}>Hi, {user.name} 👋</span>
                    <DarkToggle dark={dark} setDark={setDark} theme={theme} inline />
                </div>
            </div>

            {/* Page Content */}
            <div style={{ paddingBottom: 80 }}>
                {renderScreen()}
            </div>

            {/* Bottom Nav — horizontally scrollable */}
            <nav style={{
                position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '100%', maxWidth: 480,
                background: theme.navBg + 'ee',
                borderTop: `1px solid ${theme.navBorder}`,
                display: 'flex', overflowX: 'auto', zIndex: 100, backdropFilter: 'blur(16px)',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
            }}>
                {NAV.map(n => (
                    <button key={n.screen} id={n.id} onClick={() => setScreen(n.screen)}
                        style={{
                            flex: '0 0 auto', minWidth: 64, padding: '10px 8px 12px', background: 'transparent',
                            border: 'none', cursor: 'pointer', display: 'flex',
                            flexDirection: 'column', alignItems: 'center', gap: 3,
                            fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                        }}>
                        <span style={{ fontSize: 19 }}>{n.emoji}</span>
                        <span style={{
                            fontSize: 9, fontWeight: screen === n.screen ? 700 : 400,
                            color: screen === n.screen ? theme.accent : theme.subtext,
                            letterSpacing: 0.3,
                        }}>{n.label}</span>
                        {screen === n.screen && (
                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: theme.accent, marginTop: 1 }} />
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
}

function DarkToggle({ dark, setDark, theme, inline }) {
    return (
        <button id="dark-mode-toggle" onClick={() => setDark(d => !d)}
            title={dark ? 'Light mode' : 'Dark mode'}
            style={{
                background: theme.tagBg, border: 'none', borderRadius: 999,
                padding: inline ? '6px 10px' : '8px 14px', cursor: 'pointer',
                fontSize: 16, fontFamily: 'Inter, sans-serif', color: theme.tagText,
                fontWeight: 600,
                position: inline ? 'relative' : 'fixed',
                top: inline ? undefined : 16, right: inline ? undefined : 16,
                zIndex: inline ? undefined : 200,
            }}>
            {dark ? '☀️' : '🌙'}
        </button>
    );
}
