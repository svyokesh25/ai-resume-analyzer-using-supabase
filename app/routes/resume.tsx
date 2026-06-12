import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "~/lib/supabase";
import Summary from "~/components/Summary";
import ATS from "~/components/Ats";
import Details, { type Feedback } from "~/components/Details";

export const meta = () => [
    { title: "Resumind | Review" },
    { name: "description", content: "Detailed overview of your resume" },
];

const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
};

const fallbackFeedback: Feedback = {
    overallScore: 72,
    summary:
        "Your resume shows a strong base, but there is room to improve clarity, keyword matching, and structure for better recruiter and ATS performance.",
    atsScore: 68,
    atsTips: [
        { type: "good", tip: "Resume includes role-specific experience." },
        { type: "warning", tip: "Add more keywords from the job description." },
        { type: "warning", tip: "Use clearer section headings for ATS parsing." },
    ],
    toneAndStyle: {
        score: 70,
        tips: [
            {
                type: "good",
                tip: "Professional tone",
                explanation: "The writing style is professional and suitable for recruiters.",
            },
            {
                type: "improve",
                tip: "Reduce vague phrases",
                explanation: "Replace generic wording with specific measurable impact.",
            },
        ],
    },
    content: {
        score: 65,
        tips: [
            {
                type: "good",
                tip: "Relevant experience included",
                explanation: "Your work history appears related to the target role.",
            },
            {
                type: "improve",
                tip: "Add quantified achievements",
                explanation: "Use numbers and outcomes to make accomplishments more convincing.",
            },
        ],
    },
    structure: {
        score: 80,
        tips: [
            {
                type: "good",
                tip: "Clear section flow",
                explanation: "The resume is organized in a readable order.",
            },
            {
                type: "improve",
                tip: "Improve spacing consistency",
                explanation: "Better spacing can make the document easier to scan quickly.",
            },
        ],
    },
    skills: {
        score: 70,
        tips: [
            {
                type: "good",
                tip: "Core skills are present",
                explanation: "You list several relevant technical and professional skills.",
            },
            {
                type: "improve",
                tip: "Match job keywords",
                explanation: "Add exact skill phrases from the job description when truthful.",
            },
        ],
    },
};

function normalizeFeedback(rawFeedback: any): Feedback {
    if (!rawFeedback) return fallbackFeedback;

    if (typeof rawFeedback === "string") {
        return {
            ...fallbackFeedback,
            summary: rawFeedback,
        };
    }

    return {
        overallScore: rawFeedback.overallScore ?? fallbackFeedback.overallScore,
        summary: rawFeedback.summary ?? rawFeedback.raw ?? fallbackFeedback.summary,
        atsScore: rawFeedback.atsScore ?? fallbackFeedback.atsScore,
        atsTips: Array.isArray(rawFeedback.atsTips)
            ? rawFeedback.atsTips
            : fallbackFeedback.atsTips,
        toneAndStyle: {
            score: rawFeedback.toneAndStyle?.score ?? fallbackFeedback.toneAndStyle.score,
            tips: Array.isArray(rawFeedback.toneAndStyle?.tips)
                ? rawFeedback.toneAndStyle.tips
                : fallbackFeedback.toneAndStyle.tips,
        },
        content: {
            score: rawFeedback.content?.score ?? fallbackFeedback.content.score,
            tips: Array.isArray(rawFeedback.content?.tips)
                ? rawFeedback.content.tips
                : fallbackFeedback.content.tips,
        },
        structure: {
            score: rawFeedback.structure?.score ?? fallbackFeedback.structure.score,
            tips: Array.isArray(rawFeedback.structure?.tips)
                ? rawFeedback.structure.tips
                : fallbackFeedback.structure.tips,
        },
        skills: {
            score: rawFeedback.skills?.score ?? fallbackFeedback.skills.score,
            tips: Array.isArray(rawFeedback.skills?.tips)
                ? rawFeedback.skills.tips
                : fallbackFeedback.skills.tips,
        },
    };
}

const Resume = () => {
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState("");
    const [resumeUrl, setResumeUrl] = useState("");
    const [feedback, setFeedback] = useState<Feedback>(fallbackFeedback);

    useEffect(() => {
        const loadResume = async () => {
            if (!id) return;

            const { data, error } = await supabase
                .from("resumes")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                console.error("Failed to load resume:", error);
                setFeedback(fallbackFeedback);
                return;
            }

            if (data.resume_path) {
                const { data: resumePublic } = supabase.storage
                    .from("resumes")
                    .getPublicUrl(data.resume_path);

                setResumeUrl(resumePublic.publicUrl);
            }

            if (data.image_path) {
                const { data: imagePublic } = supabase.storage
                    .from("resumes")
                    .getPublicUrl(data.image_path);

                setImageUrl(imagePublic.publicUrl);
            }

            setFeedback(normalizeFeedback(data.feedback));
        };

        loadResume();
    }, [id]);

    return (
        <main
            style={{
                minHeight: "100vh",
                background: "#f8fafc",
            }}
        >
            <nav
                style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderBottom: "1px solid #e5e7eb",
                    background: "#ffffff",
                }}
            >
                <Link
                    to="/"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                    }}
                >
                    <img src="/icons/back.svg" alt="back" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>

            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    gap: "40px",
                    padding: "32px 40px",
                    boxSizing: "border-box",
                    maxWidth: "1280px",
                    margin: "0 auto",
                }}
            >
                <section
                    style={{
                        flex: "0 0 500px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {imageUrl ? (
                        <a
                            href={resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "block",
                                textDecoration: "none",
                            }}
                        >
                            <div
                                style={{
                                    ...cardStyle,
                                    width: "500px",
                                    minHeight: "700px",
                                    padding: "14px",
                                }}
                            >
                                <img
                                    src={imageUrl}
                                    alt="resume preview"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        borderRadius: "12px",
                                        background: "#ffffff",
                                    }}
                                />
                            </div>
                        </a>
                    ) : resumeUrl ? (
                        <a
                            href={resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                textDecoration: "underline",
                                color: "#2563eb",
                                fontWeight: 600,
                            }}
                        >
                            Open Resume PDF
                        </a>
                    ) : (
                        <div
                            style={{
                                ...cardStyle,
                                width: "500px",
                                minHeight: "700px",
                                padding: "14px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    color: "#6b7280",
                                }}
                            >
                                Resume not found.
                            </p>
                        </div>
                    )}
                </section>

                <section
                    style={{
                        flex: "1 1 0",
                        minHeight: "calc(100vh - 120px)",
                        paddingTop: "8px",
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "34px",
                            fontWeight: 500,
                            color: "#374151",
                        }}
                    >
                        Resume Review
                    </h2>

                    <div
                        style={{
                            marginTop: "28px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "18px",
                        }}
                    >
                        <Summary feedback={feedback} />

                        <div style={{ ...cardStyle, padding: "20px" }}>
                            <h3
                                style={{
                                    margin: 0,
                                    marginBottom: "12px",
                                    fontSize: "15px",
                                    fontWeight: 700,
                                    color: "#111827",
                                }}
                            >
                                Summary
                            </h3>
                            <p
                                style={{
                                    margin: 0,
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    fontSize: "14px",
                                    color: "#4b5563",
                                    lineHeight: 1.7,
                                }}
                            >
                                {feedback.summary}
                            </p>
                        </div>

                        <ATS score={feedback.atsScore} suggestions={feedback.atsTips} />

                        <Details feedback={feedback} />
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Resume;