import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/auth";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Resumind | Auth" },
        { name: "description", content: "Log into your account" },
    ];
}

export default function Auth() {
    const { isLoading, auth } = usePuterStore();
    const navigate = useNavigate();
    const [justLoggedIn, setJustLoggedIn] = useState(false);

    useEffect(() => {
        if (justLoggedIn && auth.isAuthenticated) {
            navigate("/");
        }
    }, [justLoggedIn, auth.isAuthenticated, navigate]);

    const handleClick = async () => {
        if (auth.isAuthenticated) {
            await auth.signOut();
            setJustLoggedIn(false);
        } else {
            await auth.signIn();
            setJustLoggedIn(true);
        }
    };

    return (
        <main className="auth-page">
            <div className="gradient-border">
                <section className="auth-card">
                    <div className="auth-content">
                        <h1>Welcome</h1>
                        <h2>Log In to Continue Your Job Journey</h2>
                    </div>

                    <button
                        type="button"
                        className="auth-button"
                        onClick={handleClick}
                        disabled={isLoading}
                    >
                        <p>
                            {isLoading
                                ? "Please wait..."
                                : auth.isAuthenticated
                                    ? "Log Out"
                                    : "Log In with Puter"}
                        </p>
                    </button>
                </section>
            </div>
        </main>
    );
}