"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, ArrowLeft, Zap, Brain, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"fast" | "thinking">("fast");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          conversationId,
          mode,
        }),
      });

      const data = await res.json();

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "Sorry, something went wrong.",
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Failed to connect to AI. Please try again.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  return (
    <main
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        width: "100%",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        background: "var(--bg-gradient)",
        color: "var(--text-primary)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--glass-bg)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--glass-border)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/dashboard" style={{ color: "var(--text-secondary)", display: "flex" }}>
            <ArrowLeft size={20} />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={16} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.2 }}>Appion AI</h1>
              <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", lineHeight: 1 }}>
                {mode === "fast" ? "Fast Mode" : "Thinking Mode"}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Mode Toggle */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "20px",
              padding: "3px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <button
              onClick={() => setMode("fast")}
              style={{
                padding: "6px 12px",
                borderRadius: "18px",
                border: "none",
                background: mode === "fast" ? "rgba(52, 199, 89, 0.3)" : "transparent",
                color: mode === "fast" ? "#34c759" : "var(--text-secondary)",
                fontSize: "0.7rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.2s ease",
              }}
            >
              <Zap size={12} /> Fast
            </button>
            <button
              onClick={() => setMode("thinking")}
              style={{
                padding: "6px 12px",
                borderRadius: "18px",
                border: "none",
                background: mode === "thinking" ? "rgba(255, 59, 48, 0.3)" : "transparent",
                color: mode === "thinking" ? "#ff3b30" : "var(--text-secondary)",
                fontSize: "0.7rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.2s ease",
              }}
            >
              <Brain size={12} /> Think
            </button>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          paddingBottom: "80px",
        }}
      >
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 32px rgba(74, 144, 226, 0.2)",
              }}
            >
              <Sparkles size={28} color="white" />
            </div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>Hey! I&apos;m Appion AI</h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
                maxWidth: "280px",
                lineHeight: 1.5,
              }}
            >
              Your personal productivity assistant. Ask me anything about time management, focus tips, or just chat!
            </p>

            {/* Quick Prompts */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", marginTop: "12px" }}>
              {["How can I stay focused today?", "Give me a 5-min productivity hack", "Plan my afternoon schedule"].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: "12px 16px",
                  borderRadius:
                    msg.role === "user"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                  background:
                    msg.role === "user"
                      ? "var(--accent-gradient)"
                      : "var(--glass-bg)",
                  border:
                    msg.role === "assistant"
                      ? "1px solid var(--glass-border)"
                      : "none",
                  backdropFilter: msg.role === "assistant" ? "blur(12px)" : "none",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", justifyContent: "flex-start" }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderRadius: "18px 18px 18px 4px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(12px)",
                display: "flex",
                gap: "6px",
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -6, 0],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "var(--accent-blue)",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 20px 20px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.8) 30%)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            padding: "6px 6px 6px 18px",
            border: "1px solid var(--glass-border)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Appion AI..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background:
                input.trim() && !loading
                  ? "var(--accent-gradient)"
                  : "rgba(255,255,255,0.05)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: input.trim() && !loading ? "pointer" : "default",
              transition: "all 0.2s ease",
              color: "white",
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </main>
  );
}
