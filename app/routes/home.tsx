import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import Resumecard from "~/components/Resumecard";
import { supabase } from "~/lib/supabase";

type ResumeCardData = {
    id: string;
    companyName: string;
    jobTitle: string;
    imagePath: string;
    feedback: {
        overallScore: number;
    };
};

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Resumind" },
        { name: "description", content: "Smart feedback for your dream job!" },
    ];
}

export default function Home() {
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<ResumeCardData[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(true);

    useEffect(() => {
        const loadResumes = async () => {
            setLoadingResumes(true);

            const { data, error } = await supabase
                .from("resumes")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Failed to load resumes:", error);
                setResumes([]);
                setLoadingResumes(false);
                return;
            }

            const parsedResumes: ResumeCardData[] = (data || []).map((item: any) => ({
                id: item.id,
                companyName: item.company_name,
                jobTitle: item.job_title,
                imagePath: item.image_path,
                feedback:
                    typeof item.feedback === "object" &&
                    item.feedback !== null &&
                    typeof item.feedback.overallScore === "number"
                        ? { overallScore: item.feedback.overallScore }
                        : { overallScore: 72 },
            }));

            setResumes(parsedResumes);
            setLoadingResumes(false);
        };

        loadResumes();
    }, []);

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

                {loadingResumes ? (
                    <div className="flex justify-center py-10 text-gray-600">
                        Loading resumes...
                    </div>
                ) : resumes.length > 0 ? (
                    <div className="resume-grid">
                        {resumes.map((resume) => (
                            <Resumecard key={resume.id} resume={resume} />
                        ))}
                    </div>
                ) : (
                    <div className="flex justify-center py-10 text-gray-600">
                        No resumes uploaded yet.
                    </div>
                )}
            </section>
        </main>
    );
}