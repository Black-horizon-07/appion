"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLogin) {
      // Login flow
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        // NextAuth returns generic "CredentialsSignin" — show friendly message
        const msg = res.error === "CredentialsSignin"
          ? "Invalid email or password. Please try again."
          : res.error;
        setError(msg);
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } else {
      // Registration flow
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Something went wrong.");
          setLoading(false);
          return;
        }

        // Auto-login after successful registration
        const signInRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (signInRes?.error) {
          setError("Account created, but could not auto-login.");
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } catch (err: any) {
        setError("An error occurred. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {error && (
        <div style={{ color: "var(--accent-red)", marginBottom: "16px", fontSize: "0.9rem", textAlign: "center", background: "rgba(255, 69, 58, 0.1)", padding: "10px", borderRadius: "8px" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {!isLogin && (
          <div>
            <input
              type="text"
              placeholder="Name (Optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input"
              style={{ width: "100%" }}
            />
          </div>
        )}
        <div>
          <input
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-input"
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-input"
            style={{ width: "100%" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="glass-button"
          style={{ width: "100%", opacity: loading ? 0.7 : 1, marginTop: "8px" }}
        >
          {loading ? "Please wait..." : isLogin ? "Sign In with Email" : "Create Account"}
        </button>
      </form>

      <div style={{ margin: "24px 0", position: "relative", textAlign: "center" }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "var(--card-active-border)", zIndex: 0 }}></div>
        <span style={{ position: "relative", background: "var(--card-bg)", padding: "0 12px", color: "var(--text-secondary)", fontSize: "0.85rem", zIndex: 1 }}>
          OR
        </span>
      </div>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="glass-button secondary"
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "rgba(255, 255, 255, 0.05)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <p style={{ textAlign: "center", marginTop: "24px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          style={{ color: "var(--accent-blue)", background: "none", border: "none", cursor: "pointer", fontWeight: 500, padding: 0 }}
        >
          {isLogin ? "Sign Up" : "Sign In"}
        </button>
      </p>
    </div>
  );
}
