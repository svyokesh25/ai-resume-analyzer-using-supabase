import React from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { convertPdfToImage } from "~/lib/pdf2img";
import { extractPdfText } from "~/lib/pdfTextExtractor";
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

async function readResumeText(file: File): Promise<string> {
    const name = file.name.toLowerCase();
    const mime = file.type.toLowerCase();

    // For PDFs, extract text properly using pdfjs
    if (name.endsWith(".pdf") || mime === "application/pdf") {
        return await extractPdfText(file);
    }

    // For images, we can't extract text easily without OCR
    if (mime.startsWith("image/")) {
        console.warn("Image file detected. Text extraction not available. Consider uploading a PDF.");
        return "";
    }

    // For text files, try to read directly
    try {
        return await file.text();
    } catch {
        console.error("Failed to read file as text");
        return "";
    }
}

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

    const handleAnalyze = async ({
                                     companyName,
                                     jobTitle,
                                     jobDescription,
                                     file,
                                 }: AnalyzeParams): Promise<void> => {
        setIsProcessing(true);
        setStatusText("Uploading the file...");

        if (!file) {
            setStatus({ type: "error", message: "Resume not uploaded." });
            setIsProcessing(false);
            return;
        }

        if (!jobDescription.trim()) {
            setStatus({ type: "error", message: "Please paste a job description." });
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

            const uuid = generateUUID();
            const safePdfName = file.name.replace(/\s+/g, "-");
            const safeImageName = conversion.imageFile.name.replace(/\s+/g, "-");

            const pdfPath = `pdf/${uuid}-${safePdfName}`;
            const imagePath = `preview/${uuid}-${safeImageName}`;

            setStatus({ type: "loading", message: "Uploading files…" });

            const { error: pdfError } = await supabase.storage
                .from("resumes")
                .upload(pdfPath, file, {
                    cacheControl: "3600",
                    upsert: true,
                    contentType: file.type || "application/pdf",
                });

            if (pdfError) throw pdfError;

            const { error: imageError } = await supabase.storage
                .from("resumes")
                .upload(imagePath, conversion.imageFile, {
                    cacheControl: "3600",
                    upsert: true,
                    contentType: conversion.imageFile.type || "image/png",
                });

            if (imageError) throw imageError;

            setStatus({ type: "loading", message: "Extracting resume text…" });

            const resumeText = await readResumeText(file);

            if (!resumeText.trim()) {
                setStatus({
                    type: "error",
                    message: "Could not extract text from resume. Please ensure the PDF is not image-based or try a different file.",
                });
                setIsProcessing(false);
                return;
            }

            setStatus({ type: "loading", message: "Saving resume data…" });

            const { error: dbError } = await supabase.from("resumes").insert({
                id: uuid,
                company_name: companyName,
                job_title: jobTitle,
                job_description: jobDescription,
                resume_path: pdfPath,
                image_path: imagePath,
                feedback: null,
            });

            if (dbError) throw dbError;

            setStatus({ type: "loading", message: "Analyzing with AI…" });
            setStatusText("Analyzing with AI...");

            const { data: aiFeedback, error: aiError } = await supabase.functions.invoke(
                "analyze-resume",
                {
                    body: {
                        resumeText,
                        jobTitle,
                        jobDescription,
                    },
                }
            );

            if (aiError) throw aiError;

            const { error: updateError } = await supabase
                .from("resumes")
                .update({ feedback: aiFeedback })
                .eq("id", uuid);

            if (updateError) throw updateError;

            setStatus({
                type: "success",
                message: "Analysis completed successfully.",
            });
            setStatusText("Analysis completed successfully, redirecting...");

            navigate(`/resume/${uuid}`);
        } catch (error: any) {
            console.error("Upload error:", error);
            setStatus({
                type: "error",
                message: error?.message || "Upload failed. Please try again.",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        if (!file) {
            setStatus({ type: "error", message: "Resume not uploaded." });
            return;
        }

        void handleAnalyze({
            companyName,
            jobTitle,
            jobDescription,
            file,
        });
    };

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
                                <span style={{ marginRight: 8 }}>⏳</span>
                            )}
                            {status.type === "error" && (
                                <span style={{ marginRight: 8 }}>⚠️</span>
                            )}
                            {status.type === "success" && (
                                <span style={{ marginRight: 8 }}>✅</span>
                            )}
                            {status.message}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        style={{ display: "flex", flexDirection: "column", gap: 20 }}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label
                                htmlFor="company-name"
                                style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}
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

                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label
                                htmlFor="job-title"
                                style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}
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

                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label
                                htmlFor="job-description"
                                style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}
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

                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label
                                htmlFor="resume-upload"
                                style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}
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
                            type="submit"
                            disabled={isProcessing}
                            style={{
                                marginTop: "8px",
                                width: "100%",
                                borderRadius: "999px",
                                background: isProcessing
                                    ? "linear-gradient(90deg, #a89af5, #c4b5fd)"
                                    : "linear-gradient(90deg, #6a5af9, #8b5cf6)",
                                border: "none",
                                padding: "14px 24px",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#fff",
                                cursor: isProcessing ? "not-allowed" : "pointer",
                                boxShadow: "0 4px 15px rgba(106,90,249,0.35)",
                            }}
                        >
                            {isProcessing ? statusText : "Analyze Resume"}
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
};

export default Upload;