import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import Resumecard from "~/components/Resumecard";
import { resumes } from "../../constants";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Resumind" },
        { name: "description", content: "Smart feedback for your dream job!" },
    ];
}

export default function Home() {
    const { auth, isLoading, init } = usePuterStore();
    const navigate = useNavigate();

    useEffect(() => {
        init();
    }, [init]);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate("/auth");
        }
    }, [isLoading, auth.isAuthenticated, navigate]);

    if (isLoading) {
        return <main className="min-h-screen">Loading...</main>;
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Track Your Applications & Resume Ratings</h1>
                    <h2>Review your submissions and check AI-powered feedback.</h2>
                </div>

                {resumes.length > 0 && (
                    <div className="resume-grid">
                        {resumes.map((resume: Resume) => (
                            <Resumecard key={resume.id} resume={resume} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}