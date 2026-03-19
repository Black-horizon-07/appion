import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "16px", background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Productivity Tracker
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "300px", margin: "0 auto", lineHeight: 1.5 }}>
          Align your real-time activities with your Google Calendar scheduling.
        </p>
      </div>

      <div className="glass-card" style={{ width: "100%", textAlign: "center", padding: "40px 24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "var(--card-active-bg)", border: "1px solid var(--card-active-border)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
              <path d="m9 16 2 2 4-4"/>
            </svg>
          </div>
        </div>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", fontWeight: 600 }}>Get Started</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "0.95rem" }}>
          Sign in/Sign up to begin tracking your true productivity score.
        </p>
        
        <AuthForm />
      </div>
    </main>
  );
}
