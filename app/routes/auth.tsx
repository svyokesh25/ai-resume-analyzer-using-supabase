import { useNavigate } from "react-router";
import type { Route } from "./+types/auth";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Resumind | Auth" },
        { name: "description", content: "Continue to resume upload" },
    ];
}

export default function Auth() {
    const navigate = useNavigate();

    return (
        <main
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f3f4f6",
                padding: "24px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    background: "#ffffff",
                    borderRadius: "20px",
                    padding: "32px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    border: "1px solid #e5e7eb",
                    textAlign: "center",
                }}
            >
                <h1
                    style={{
                        margin: 0,
                        fontSize: "28px",
                        fontWeight: 700,
                        color: "#111827",
                    }}
                >
                    Welcome to Resumind
                </h1>

                <p
                    style={{
                        marginTop: "12px",
                        marginBottom: "24px",
                        fontSize: "15px",
                        color: "#6b7280",
                        lineHeight: 1.6,
                    }}
                >
                    Continue to upload your resume and review feedback with Supabase.
                </p>

                <button
                    onClick={() => navigate("/upload")}
                    style={{
                        width: "100%",
                        border: "none",
                        borderRadius: "999px",
                        background: "linear-gradient(90deg, #6a5af9, #8b5cf6)",
                        padding: "14px 20px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#fff",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(106,90,249,0.35)",
                    }}
                >
                    Continue
                </button>
            </div>
        </main>
    );
}