"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Calendar as CalendarIcon, Clock, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [localTasks, setLocalTasks] = useState<{id: string; title: string; date: string; done: boolean}[]>([]);

  // Load local tasks from localStorage safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem("appion_local_tasks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setLocalTasks(parsed);
      }
    } catch (e) {
      console.error("Failed to parse local tasks", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("appion_local_tasks", JSON.stringify(localTasks));
  }, [localTasks]);

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const res = await fetch(`/api/calendar?timezone=${timezone}`);
        const data = await res.json();

        if (data.upcomingEvents) {
          const now = new Date().getTime();
          const futureEvents = data.upcomingEvents.filter((event: CalendarEvent) => {
            const end = new Date(event.end?.dateTime || event.end?.date || "").getTime();
            return end > now;
          });
          setEvents(futureEvents);
        }
      } catch (err) {
        console.error("Failed to fetch calendar", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCalendar();
  }, []);

  const formatEventTime = (event: CalendarEvent) => {
    if (event.start?.date) return "All Day";
    const start = new Date(event.start?.dateTime || "");
    const end = new Date(event.end?.dateTime || "");
    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Generate mini calendar days (current week)
  const getWeekDays = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const days = [];
    for (let i = -dayOfWeek; i < 7 - dayOfWeek; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const addLocalTask = () => {
    if (!newTask.trim() || !selectedDate) return;
    const task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      date: selectedDate.toDateString(),
      done: false,
    };
    setLocalTasks((prev) => [...prev, task]);
    setNewTask("");
    setShowAddModal(false);
  };

  const toggleTask = (id: string) => {
    setLocalTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: string) => {
    setLocalTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const todayTasks = localTasks.filter((t) => t.date === selectedDate.toDateString());



  return (
    <main className="container" style={{ paddingBottom: '100px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Schedule</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </header>

      {/* Week Selector */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', justifyContent: 'space-between' }}>
        {weekDays.map((day) => {
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = day.toDateString() === selectedDate.toDateString();
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '14px',
                background: isSelected ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.04)',
                border: isToday && !isSelected ? '1px solid var(--accent-blue)' : '1px solid transparent',
                color: isSelected ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{dayNames[day.getDay()]}</span>
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>{day.getDate()}</span>
            </button>
          );
        })}
      </div>

      {/* Local Tasks */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>My Tasks</h2>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: 'var(--accent-gradient)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            <Plus size={16} />
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '24px', opacity: 0.7 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No tasks for this day</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AnimatePresence>
              {todayTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  className="glass-card"
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      border: task.done ? 'none' : '2px solid var(--text-secondary)',
                      background: task.done ? 'var(--accent-gradient)' : 'transparent',
                      cursor: 'pointer',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  >
                    {task.done && "✓"}
                  </button>
                  <span style={{ flex: 1, textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.5 : 1, fontSize: '0.95rem' }}>
                    {task.title}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', opacity: 0.5 }}
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Google Calendar Events */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={16} color="var(--accent-blue)" /> Google Calendar
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading schedule...</div>
        ) : events.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No upcoming events</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {events.slice(0, 10).map((event, index) => {
              const isCurrent = index === 0 && new Date(event.start?.dateTime || event.start?.date || "").getTime() <= new Date().getTime();
              return (
                <div key={event.id || index} className="glass-card" style={{
                  padding: '16px',
                  borderLeft: isCurrent ? '3px solid var(--accent-blue)' : '1px solid transparent',
                }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>
                    {event.summary || "Busy"}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isCurrent ? 'var(--accent-blue)' : 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <Clock size={12} />
                    <span>{formatEventTime(event)}</span>
                    {isCurrent && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 600, background: 'var(--accent-blue)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>NOW</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '480px',
                background: 'rgba(28, 28, 32, 0.95)',
                backdropFilter: 'blur(40px)',
                borderRadius: '24px 24px 12px 12px',
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Add Task</h3>
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLocalTask()}
                placeholder="What do you need to do?"
                autoFocus
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  marginBottom: '16px',
                }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Cancel
                </button>
                <button
                  onClick={addLocalTask}
                  className="glass-button"
                  style={{ flex: 1 }}
                >
                  Add Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
