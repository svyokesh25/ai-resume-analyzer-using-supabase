import { useNavigate } from "react-router";
import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import Resumecard from "~/components/Resumecard";
import { resumes } from "../../constants";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Resumind" },
        { name: "description", content: "Smart feedback for your dream job!" },
    ];
}

export default function Home() {
    const navigate = useNavigate();

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Track Your Applications & Resume Ratings</h1>
                    <h2>Review your submissions and check AI-powered feedback.</h2>
                </div>

                <div className="flex justify-center mb-10">
                    <button
                        type="button"
                        onClick={() => navigate("/upload")}
                        className="bg-[#6a5af9] text-white px-6 py-3 rounded-full font-semibold shadow-md hover:opacity-90 transition"
                    >
                        Upload Resume
                    </button>
                </div>

                {resumes.length > 0 && (
                    <div className="resume-grid">
                        {resumes.map((resume: any) => (
                            <Resumecard key={resume.id} resume={resume} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}