import React from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { convertPdfToImage } from "~/lib/pdf2img";
import { useNavigate } from "react-router";
import { generateUUID } from "~/lib/utils";
import { usePuterStore } from "~/lib/puter";
import { prepareInstructions } from "../../constants";

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

async function toImageFile(
    file: File
): Promise<{ imageFile: File; imageUrl: string } | { error: string }> {
    const name = file.name.toLowerCase();
    const mime = file.type.toLowerCase();

    if (mime.startsWith("image/")) {
        return { imageFile: file, imageUrl: URL.createObjectURL(file) };
    }

    if (name.endsWith(".pdf") || mime === "application/pdf") {
        let result;
        try {
            result = await convertPdfToImage(file);
        } catch {
            return { error: "Couldn't convert PDF — please try again." };
        }

        if (result.error || !result.file) {
            return {
                error: result.error
                    ? `Couldn't convert PDF: ${result.error}`
                    : "Couldn't convert PDF — please try again.",
            };
        }

        return { imageFile: result.file, imageUrl: result.imageUrl };
    }

    return {
        error: `Unsupported file type "${
            file.name.split(".").pop()?.toUpperCase() ?? "unknown"
        }". Please upload a PDF or image.`,
    };
}

const Upload = (): React.JSX.Element => {
    const aiFeedback = usePuterStore((state) => state.ai.feedback);

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
            await window.puter.kv.flush();
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
            setStatus({ type: "loading", message: "Converting resume…" });

            const conversion = await toImageFile(file);
            if ("error" in conversion) {
                setStatus({ type: "error", message: conversion.error });
                setIsProcessing(false);
                return;
            }

            setStatus({ type: "loading", message: "Uploading resume…" });

            const uploadedFileResult = await window.puter.fs.upload([file]);
            const uploadedFile = Array.isArray(uploadedFileResult)
                ? uploadedFileResult[0]
                : uploadedFileResult;

            if (!uploadedFile?.path) {
                setStatus({
                    type: "error",
                    message: "Failed to upload resume — please try again.",
                });
                setIsProcessing(false);
                return;
            }

            setStatusText("Preparing data...");

            const uuid = generateUUID();
            const data: {
                id: string;
                resumePath: string;
                imagePath: string | null;
                companyName: string;
                jobTitle: string;
                jobDescription: string;
                feedback: any;
            } = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: null,
                companyName,
                jobTitle,
                jobDescription,
                feedback: null,
            };

            await window.puter.kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatus({ type: "loading", message: "Analyzing resume…" });
            setStatusText("Analyzing...");

            try {
                const feedback = await aiFeedback(
                    uploadedFile.path,
                    prepareInstructions({
                        jobTitle,
                        jobDescription,
                        AIResponseFormat: "json",
                    })
                );

                if (feedback) {
                    const content = feedback.message.content;

                    const feedbackText =
                        typeof content === "string"
                            ? content
                            : content[0]?.type === "text"
                                ? content[0].text
                                : "";

                    let parsedFeedback: any;

                    try {
                        parsedFeedback = JSON.parse(feedbackText);
                    } catch (error) {
                        console.error("JSON parse error:", error);
                        parsedFeedback = {
                            raw: feedbackText.slice(0, 5000),
                        };
                    }

                    const stringifiedFeedback = JSON.stringify(parsedFeedback);

                    data.feedback =
                        stringifiedFeedback.length > 200000
                            ? {
                                raw: stringifiedFeedback.slice(0, 200000),
                            }
                            : parsedFeedback;

                    await window.puter.kv.set(`resume:${uuid}`, JSON.stringify(data));

                    setStatus({
                        type: "success",
                        message: "Analysis completed successfully.",
                    });
                    setStatusText("Analysis completed successfully, redirecting...");
                } else {
                    setStatus({
                        type: "success",
                        message: "Resume uploaded. AI feedback unavailable right now.",
                    });
                    setStatusText("Redirecting to resume page...");
                }
            } catch (aiError: any) {
                console.error("AI feedback error:", aiError);

                setStatus({
                    type: "success",
                    message: "Resume uploaded. AI usage limit reached, opening resume page.",
                });
                setStatusText("Redirecting to resume page...");
            }

            navigate(`/resume/${uuid}`);
        } catch (error: any) {
            console.error("Analyze error:", error);
            setStatus({
                type: "error",
                message: error?.message || "Storage limit reached",
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