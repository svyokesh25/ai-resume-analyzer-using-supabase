import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "~/lib/supabase";
import Summary from "~/components/Summary";
import ATS from "~/components/Ats";

export const meta = () => [
    { title: "Resumind | Review" },
    { name: "description", content: "Detailed overview of your resume" },
];

type DetailedTip = {
    type: "good" | "improve";
    tip: string;
    explanation: string;
};

type FeedbackData = {
    overallScore: number;
    summary: string;
    atsScore: number;
    atsTips: { type: "good" | "warning"; tip: string }[];
    toneAndStyle: {
        score: number;
        tips: DetailedTip[];
    };
    content: {
        score: number;
        tips: DetailedTip[];
    };
    structure: {
        score: number;
        tips: DetailedTip[];
    };
    skills: {
        score: number;
        tips: DetailedTip[];
    };
};

const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
};

const Resume = () => {
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState("");
    const [resumeUrl, setResumeUrl] = useState("");
    const [feedback, setFeedback] = useState<FeedbackData | null>(null);
    const [loading, setLoading] = useState(true);

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
                setLoading(false);
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

            if (data.feedback && typeof data.feedback === "object") {
                setFeedback(data.feedback as FeedbackData);
            } else {
                setFeedback(null);
            }

            setLoading(false);
        };

        loadResume();
    }, [id]);

    const renderTipSection = (title: string, tips: DetailedTip[] = []) => (
        <div
            style={{
                ...cardStyle,
                padding: "20px",
            }}
        >
            <h3
                style={{
                    margin: 0,
                    marginBottom: "12px",
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#111827",
                }}
            >
                {title}
            </h3>

            {tips.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {tips.map((tip, index) => (
                        <div key={`${title}-${index}`}>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    color:
                                        tip.type === "good" ? "#15803d" : "#b45309",
                                }}
                            >
                                {tip.tip}
                            </p>
                            <p
                                style={{
                                    margin: 0,
                                    marginTop: "6px",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    fontSize: "14px",
                                    color: "#4b5563",
                                    lineHeight: 1.7,
                                }}
                            >
                                {tip.explanation}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p
                    style={{
                        margin: 0,
                        fontSize: "14px",
                        color: "#6b7280",
                        lineHeight: 1.7,
                    }}
                >
                    No detailed feedback available yet.
                </p>
            )}
        </div>
    );

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
                    <span className="text-gray-800 text-sm font-semibold">
                        Back to Homepage
                    </span>
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
                        {loading ? (
                            <div style={{ ...cardStyle, padding: "20px" }}>
                                <p style={{ margin: 0, color: "#6b7280" }}>
                                    Loading feedback...
                                </p>
                            </div>
                        ) : feedback ? (
                            <>
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

                                <ATS
                                    score={feedback.atsScore}
                                    suggestions={feedback.atsTips}
                                />

                                {renderTipSection(
                                    "Tone & Style Feedback",
                                    feedback.toneAndStyle?.tips
                                )}
                                {renderTipSection(
                                    "Content Feedback",
                                    feedback.content?.tips
                                )}
                                {renderTipSection(
                                    "Structure Feedback",
                                    feedback.structure?.tips
                                )}
                                {renderTipSection(
                                    "Skills Feedback",
                                    feedback.skills?.tips
                                )}
                            </>
                        ) : (
                            <div style={{ ...cardStyle, padding: "20px" }}>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "14px",
                                        color: "#6b7280",
                                        lineHeight: 1.7,
                                    }}
                                >
                                    No feedback available yet.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Resume;