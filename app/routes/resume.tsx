import { Link, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "~/lib/supabase";

export const meta = () => [
    { title: "Resumind | Review" },
    { name: "description", content: "Detailed overview of your resume" },
];

type FeedbackData = {
    summary?: string;
    ats?: string;
    details?: string;
    raw?: string;
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

            if (typeof data.feedback === "string") {
                setFeedback({
                    summary: data.feedback,
                    ats: "ATS score not available yet.",
                    details: "Detailed suggestions are not available yet.",
                });
            } else if (data.feedback?.summary || data.feedback?.ats || data.feedback?.details) {
                setFeedback({
                    summary: data.feedback.summary || "No summary available yet.",
                    ats: data.feedback.ats || "ATS score not available yet.",
                    details: data.feedback.details || "Detailed suggestions are not available yet.",
                });
            } else if (data.feedback?.raw) {
                setFeedback({
                    summary: data.feedback.raw,
                    ats: "ATS score not available yet.",
                    details: "Detailed suggestions are not available yet.",
                });
            } else {
                setFeedback({
                    summary: "No feedback available yet.",
                    ats: "ATS score not available yet.",
                    details: "Detailed suggestions are not available yet.",
                });
            }
        };

        loadResume();
    }, [id]);

    const sections = useMemo(
        () => [
            { title: "Summary", content: feedback?.summary || "No summary available yet." },
            { title: "ATS", content: feedback?.ats || "ATS score not available yet." },
            { title: "Details", content: feedback?.details || "Detailed suggestions are not available yet." },
        ],
        [feedback]
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
                        {sections.map((section) => (
                            <div
                                key={section.title}
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
                                    {section.title}
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
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Resume;