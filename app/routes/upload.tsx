import React from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { useNavigate } from "react-router";
import { generateUUID } from "~/lib/utils";
import { supabase } from "~/lib/supabase";

interface AnalyzeParams {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
}

type StatusState =
    | { type: "idle" }
    | { type: "loading"; message: string }
    | { type: "error"; message: string }
    | { type: "success"; message: string };

const Upload = (): React.JSX.Element => {
    const [file, setFile] = React.useState<File | null>(null);
    const navigate = useNavigate();
    const [companyName, setCompanyName] = React.useState("");
    const [jobTitle, setJobTitle] = React.useState("");
    const [jobDescription, setJobDescription] = React.useState("");
    const [status, setStatus] = React.useState<StatusState>({ type: "idle" });
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [statusText, setStatusText] = React.useState("");

    const handleFileSelect = (selectedFile: File | null): void => {
        setFile(selectedFile);
        if (status.type === "error" || status.type === "success") {
            setStatus({ type: "idle" });
        }
    };

    const handleClearStorage = async (): Promise<void> => {
        try {
            setStatus({ type: "loading", message: "Clearing app storage..." });

            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith("resume:")) {
                    localStorage.removeItem(key);
                }
            });

            setFile(null);
            setStatus({
                type: "success",
                message: "App data cleared successfully.",
            });
        } catch (error: any) {
            console.error("Clear storage error:", error);
            setStatus({
                type: "error",
                message: error?.message || "Failed to clear app storage.",
            });
        }
    };

    const handleAnalyze = async ({
                                     companyName,
                                     jobTitle,
                                     jobDescription,
                                     file,
                                 }: AnalyzeParams): Promise<void> => {
        setIsProcessing(true);
        setStatusText("Uploading the file...");

        if (!file) {
            setStatus({ type: "error", message: "PDF not uploaded." });
            setIsProcessing(false);
            return;
        }

        try {
            setStatus({ type: "loading", message: "Uploading resume…" });

            const uuid = generateUUID();
            const fileExt = file.name.split(".").pop() || "pdf";
            const fileName = `${uuid}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("resumes")
                .upload(filePath, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) {
                setStatus({
                    type: "error",
                    message: uploadError.message || "Failed to upload resume.",
                });
                setIsProcessing(false);
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from("resumes")
                .getPublicUrl(filePath);

            const data = {
                id: uuid,
                resumePath: filePath,
                resumeUrl: publicUrlData.publicUrl,
                imagePath: null,
                imageUrl: null,
                companyName,
                jobTitle,
                jobDescription,
                feedback: null,
            };

            localStorage.setItem(`resume:${uuid}`, JSON.stringify(data));

            setStatus({
                type: "success",
                message: "Resume uploaded successfully.",
            });
            setStatusText("Redirecting...");

            navigate(`/resume/${uuid}`);
        } catch (error: any) {
            console.error("Analyze error:", error);
            setStatus({
                type: "error",
                message: error?.message || "Something went wrong.",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        if (!file) {
            setStatus({ type: "error", message: "PDF not uploaded." });
            return;
        }

        void handleAnalyze({
            companyName,
            jobTitle,
            jobDescription,
            file,
        });
    };

    const isLoading = isProcessing;

    return (
        <main
            style={{
                minHeight: "100vh",
                background:
                    "linear-gradient(135deg, #f3edf7 0%, #ede8f5 50%, #e8e0f5 100%)",
            }}
        >
            <Navbar />

            <section
                style={{
                    display: "flex",
                    minHeight: "calc(100vh - 80px)",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "48px 16px",
                }}
            >
                <div
                    style={{
                        width: "100%",
                        maxWidth: "600px",
                        borderRadius: "32px",
                        background: "rgba(255,255,255,0.6)",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 20px 60px rgba(106,90,249,0.1)",
                        padding: "48px 40px",
                    }}
                >
                    <div style={{ textAlign: "center", marginBottom: "40px" }}>
                        <h1
                            style={{
                                fontSize: "clamp(28px, 5vw, 44px)",
                                fontWeight: 700,
                                letterSpacing: "-0.5px",
                                color: "#111",
                                margin: 0,
                                lineHeight: 1.2,
                            }}
                        >
                            Smart feedback for your dream job
                        </h1>

                        <p
                            style={{
                                marginTop: "12px",
                                fontSize: "16px",
                                color: "#6b7280",
                            }}
                        >
                            Drop your resume for an ATS score and improvement tips
                        </p>
                    </div>

                    {status.type !== "idle" && (
                        <div
                            style={{
                                marginBottom: "20px",
                                padding: "12px 16px",
                                borderRadius: "12px",
                                fontSize: "14px",
                                fontWeight: 500,
                                background:
                                    status.type === "error"
                                        ? "#fef2f2"
                                        : status.type === "success"
                                            ? "#f0fdf4"
                                            : "#f5f3ff",
                                color:
                                    status.type === "error"
                                        ? "#dc2626"
                                        : status.type === "success"
                                            ? "#16a34a"
                                            : "#6a5af9",
                                border: `1px solid ${
                                    status.type === "error"
                                        ? "#fecaca"
                                        : status.type === "success"
                                            ? "#bbf7d0"
                                            : "#ddd6fe"
                                }`,
                            }}
                        >
                            {status.type === "loading" && (
                                <span style={{ marginRight: "8px" }}>⏳</span>
                            )}
                            {status.type === "error" && (
                                <span style={{ marginRight: "8px" }}>⚠️</span>
                            )}
                            {status.type === "success" && (
                                <span style={{ marginRight: "8px" }}>✅</span>
                            )}
                            {status.message}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label
                                htmlFor="company-name"
                                style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
                            >
                                Company Name
                            </label>
                            <input
                                id="company-name"
                                name="companyName"
                                type="text"
                                placeholder="e.g. Google, Stripe"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                style={{
                                    width: "100%",
                                    borderRadius: "12px",
                                    border: "1px solid #e5e7eb",
                                    background: "#fff",
                                    padding: "12px 16px",
                                    fontSize: "14px",
                                    color: "#111",
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label
                                htmlFor="job-title"
                                style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
                            >
                                Job Title
                            </label>
                            <input
                                id="job-title"
                                name="jobTitle"
                                type="text"
                                placeholder="e.g. Senior Frontend Engineer"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                style={{
                                    width: "100%",
                                    borderRadius: "12px",
                                    border: "1px solid #e5e7eb",
                                    background: "#fff",
                                    padding: "12px 16px",
                                    fontSize: "14px",
                                    color: "#111",
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label
                                htmlFor="job-description"
                                style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
                            >
                                Job Description
                            </label>
                            <textarea
                                id="job-description"
                                name="jobDescription"
                                rows={5}
                                placeholder="Paste the full job description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                style={{
                                    width: "100%",
                                    borderRadius: "12px",
                                    border: "1px solid #e5e7eb",
                                    background: "#fff",
                                    padding: "12px 16px",
                                    fontSize: "14px",
                                    color: "#111",
                                    outline: "none",
                                    resize: "none",
                                    boxSizing: "border-box",
                                    fontFamily: "inherit",
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label
                                htmlFor="resume-upload"
                                style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
                            >
                                Upload Resume
                            </label>
                            <FileUploader
                                id="resume-upload"
                                file={file}
                                onFileSelect={handleFileSelect}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleClearStorage}
                            style={{
                                width: "100%",
                                borderRadius: "999px",
                                background: "#ef4444",
                                border: "none",
                                padding: "14px 24px",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#fff",
                                cursor: "pointer",
                            }}
                        >
                            Clear Storage
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                marginTop: "8px",
                                width: "100%",
                                borderRadius: "999px",
                                background: isLoading
                                    ? "linear-gradient(90deg, #a89af5, #c4b5fd)"
                                    : "linear-gradient(90deg, #6a5af9, #8b5cf6)",
                                border: "none",
                                padding: "14px 24px",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#fff",
                                cursor: isLoading ? "not-allowed" : "pointer",
                                boxShadow: "0 4px 15px rgba(106,90,249,0.35)",
                                transition: "background 0.2s",
                            }}
                        >
                            {isLoading ? statusText : "Analyze Resume"}
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
};

export default Upload;