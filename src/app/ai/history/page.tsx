"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, Trash2, MessageSquare, Zap, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface ChatPreview {
  id: string;
  title: string;
  mode: string;
  updatedAt: string;
  messages: { content: string }[];
}

export default function AIHistoryPage() {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/ai/history");
      const data = await res.json();
      setChats(data.conversations || []);
    } catch (err) {
      console.error("Failed to fetch chats", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (id: string) => {
    try {
      await fetch("/api/ai/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: id }),
      });
      setChats((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  };

  const deleteAll = async () => {
    for (const chat of chats) {
      await deleteChat(chat.id);
    }
  };

  return (
    <main className="container" style={{ paddingBottom: "100px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <Link href="/profile" style={{ color: "var(--text-secondary)", display: "flex" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 600 }}>AI Chat History</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {chats.length} conversation{chats.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      {chats.length > 1 && (
        <button
          onClick={deleteAll}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            background: "rgba(255, 59, 48, 0.1)",
            border: "1px solid rgba(255, 59, 48, 0.2)",
            color: "#ff3b30",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Trash2 size={14} /> Delete All Chats
        </button>
      )}

      {loading ? (
        <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px 0" }}>
          Loading...
        </div>
      ) : chats.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <MessageSquare size={40} color="var(--text-secondary)" style={{ opacity: 0.3 }} />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>No conversations yet</p>
          <Link
            href="/ai"
            className="glass-button"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "8px" }}
          >
            <Sparkles size={16} /> Start a Chat
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <AnimatePresence>
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
                className="glass-card"
                style={{
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    {chat.mode === "thinking" ? (
                      <Brain size={14} color="#ff3b30" />
                    ) : (
                      <Zap size={14} color="#34c759" />
                    )}
                    <p
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {chat.title}
                    </p>
                  </div>
                  {chat.messages[0] && (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {chat.messages[0].content}
                    </p>
                  )}
                  <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "6px", opacity: 0.6 }}>
                    {new Date(chat.updatedAt).toLocaleDateString()} · {new Date(chat.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <button
                  onClick={() => deleteChat(chat.id)}
                  style={{
                    background: "rgba(255, 59, 48, 0.1)",
                    border: "none",
                    color: "#ff3b30",
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "10px",
                    display: "flex",
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
