import React, { useState, useEffect } from 'react';
import { MOODS } from '../constants/moods.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDominantMood(entries, dateStr) {
    const dayEntries = entries.filter(e => {
        const d = new Date(e.date);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === dateStr;
    });
    if (!dayEntries.length) return null;
    // pick last entry of the day
    const last = dayEntries[dayEntries.length - 1];
    return MOODS.find(m => m.emoji === last.mood) || null;
}

function getDayEntries(entries, year, month, day) {
    return entries.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
}

export default function CalendarView({ theme, entries = [] }) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selected, setSelected] = useState(null); // { year, month, day }

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => {
        if (month === 0) { setYear(y => y - 1); setMonth(11); }
        else setMonth(m => m - 1);
        setSelected(null);
    };
    const nextMonth = () => {
        if (month === 11) { setYear(y => y + 1); setMonth(0); }
        else setMonth(m => m + 1);
        setSelected(null);
    };

    // Build calendar grid (blanks + day numbers)
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const selEntries = selected ? getDayEntries(entries, selected.year, selected.month, selected.day) : [];

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', padding: '24px 20px', maxWidth: 440, margin: '0 auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text, marginBottom: 6 }}>📅 Mood Calendar</h2>
            <p style={{ color: theme.subtext, fontSize: 14, marginBottom: 24 }}>See your emotional journey over time.</p>

            {/* Month Navigator */}
            <div style={{
                background: theme.card, border: `1px solid ${theme.cardBorder}`,
                borderRadius: 20, padding: '18px 16px', boxShadow: theme.shadowCard,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <button onClick={prevMonth} style={navBtn(theme)}>‹</button>
                    <span style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>
                        {MONTHS[month]} {year}
                    </span>
                    <button onClick={nextMonth} style={navBtn(theme)}>›</button>
                </div>

                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                    {DAYS.map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: theme.subtext, padding: '4px 0' }}>
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                    {cells.map((day, i) => {
                        if (!day) return <div key={`blank-${i}`} />;
                        const ds = `${year}-${month}-${day}`;
                        const mood = getDominantMood(entries, ds);
                        const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
                        const isSel = selected?.year === year && selected?.month === month && selected?.day === day;

                        return (
                            <button
                                key={day}
                                onClick={() => setSelected(isSel ? null : { year, month, day })}
                                style={{
                                    aspectRatio: '1',
                                    borderRadius: 10,
                                    border: `2px solid ${isSel ? theme.accent : isToday ? theme.accent + '66' : 'transparent'}`,
                                    background: mood ? mood.color + '33' : theme.inputBg,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1,
                                    transition: 'all 0.15s',
                                    fontFamily: 'Inter, sans-serif',
                                    position: 'relative',
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <span style={{ fontSize: 11, fontWeight: isToday ? 800 : 500, color: theme.text }}>{day}</span>
                                {mood && <span style={{ fontSize: 13 }}>{mood.emoji}</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16, justifyContent: 'center' }}>
                    {MOODS.map(m => (
                        <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color }} />
                            <span style={{ fontSize: 11, color: theme.subtext }}>{m.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Day Panel */}
            {selected && (
                <div style={{
                    marginTop: 16,
                    background: theme.card, border: `1px solid ${theme.cardBorder}`,
                    borderRadius: 20, padding: '18px', boxShadow: theme.shadowCard,
                    animation: 'fadeIn 0.3s ease',
                }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 12 }}>
                        {MONTHS[selected.month]} {selected.day}, {selected.year}
                    </div>
                    {selEntries.length === 0 ? (
                        <div style={{ fontSize: 13, color: theme.subtext, textAlign: 'center', padding: '20px 0' }}>
                            No entries for this day
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {selEntries.map(e => (
                                <div key={e.id} style={{
                                    background: theme.accentLight, borderRadius: 14, padding: '12px 14px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <span style={{ fontSize: 20 }}>{e.mood}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{e.moodLabel}</span>
                                        <span style={{ marginLeft: 'auto', fontSize: 11, color: theme.subtext }}>
                                            {new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    {e.text && <p style={{ fontSize: 13, color: theme.text, margin: 0, lineHeight: 1.55 }}>
                                        {e.text.slice(0, 150)}{e.text.length > 150 ? '…' : ''}
                                    </p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function navBtn(theme) {
    return {
        background: theme.accentLight, border: 'none', borderRadius: 10,
        width: 34, height: 34, cursor: 'pointer', fontSize: 20,
        color: theme.accent, fontWeight: 700, fontFamily: 'Inter, sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    };
}
