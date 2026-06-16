import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import Resumecard from "~/components/Resumecard";
import { supabase } from "~/lib/supabase";

type ResumeRow = {
    id: string;
    company_name: string;
    job_title: string;
    image_path: string | null;
    feedback: {
        overallScore?: number;
    } | null;
};

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadResumes = async () => {
            const { data, error } = await supabase
                .from("resumes")
                .select("id, company_name, job_title, image_path, feedback")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Failed to load resumes:", error);
                setLoading(false);
                return;
            }

            const mapped = (data as ResumeRow[]).map((resume) => {
                let publicImageUrl = "";

                if (resume.image_path) {
                    const { data: imagePublic } = supabase.storage
                        .from("resumes")
                        .getPublicUrl(resume.image_path);

                    publicImageUrl = imagePublic.publicUrl;
                }

                return {
                    id: resume.id,
                    companyName: resume.company_name,
                    jobTitle: resume.job_title,
                    imagePath: publicImageUrl,
                    feedback: {
                        overallScore: resume.feedback?.overallScore ?? 0,
                    },
                };
            });

            setResumes(mapped);
            setLoading(false);
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

                {loading ? (
                    <p className="text-center text-gray-600">Loading resumes...</p>
                ) : resumes.length > 0 ? (
                    <div className="resume-grid">
                        {resumes.map((resume) => (
                            <Resumecard key={resume.id} resume={resume} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-600">
                        No resumes uploaded yet.
                    </p>
                )}
            </section>
        </main>
    );
}