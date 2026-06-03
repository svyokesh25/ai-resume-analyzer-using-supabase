import React from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";

const Upload = (): React.JSX.Element => {
    const [file, setFile] = React.useState<File | null>(null);

    const handleFileSelect = (selectedFile: File | null): void => {
        setFile(selectedFile);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (!file) return;
    };

    interface AnalyzeParams {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file: File;
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: AnalyzeParams): Promise<void> => {
        // your logic here
    };

    return (
        <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f3edf7 0%, #ede8f5 50%, #e8e0f5 100%)" }}>
            <Navbar />

            <section style={{ display: "flex", minHeight: "calc(100vh - 80px)", alignItems: "center", justifyContent: "center", padding: "48px 16px" }}>
                <div style={{ width: "100%", maxWidth: "600px", borderRadius: "32px", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", boxShadow: "0 20px 60px rgba(106,90,249,0.1)", padding: "48px 40px" }}>

                    <div style={{ textAlign: "center", marginBottom: "40px" }}>
                        <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, letterSpacing: "-0.5px", color: "#111", margin: 0, lineHeight: 1.2 }}>
                            Smart feedback for your dream job
                        </h1>
                        <p style={{ marginTop: "12px", fontSize: "16px", color: "#6b7280" }}>
                            Drop your resume for an ATS score and improvement tips
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label htmlFor="company-name" style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                                Company Name
                            </label>
                            <input
                                id="company-name"
                                name="company-name"
                                type="text"
                                placeholder="e.g. Google, Stripe"
                                style={{ width: "100%", borderRadius: "12px", border: "1px solid #e5e7eb", background: "#fff", padding: "12px 16px", fontSize: "14px", color: "#111", outline: "none", boxSizing: "border-box" }}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label htmlFor="job-title" style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                                Job Title
                            </label>
                            <input
                                id="job-title"
                                name="job-title"
                                type="text"
                                placeholder="e.g. Senior Frontend Engineer"
                                style={{ width: "100%", borderRadius: "12px", border: "1px solid #e5e7eb", background: "#fff", padding: "12px 16px", fontSize: "14px", color: "#111", outline: "none", boxSizing: "border-box" }}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label htmlFor="job-description" style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                                Job Description
                            </label>
                            <textarea
                                id="job-description"
                                name="job-description"
                                rows={5}
                                placeholder="Paste the full job description here..."
                                style={{ width: "100%", borderRadius: "12px", border: "1px solid #e5e7eb", background: "#fff", padding: "12px 16px", fontSize: "14px", color: "#111", outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                                Upload Resume
                            </label>
                            <FileUploader onFileSelect={handleFileSelect} />
                        </div>

                        <button
                            type="submit"
                            style={{ marginTop: "8px", width: "100%", borderRadius: "999px", background: "linear-gradient(90deg, #6a5af9, #8b5cf6)", border: "none", padding: "14px 24px", fontSize: "14px", fontWeight: 600, color: "#fff", cursor: "pointer", boxShadow: "0 4px 15px rgba(106,90,249,0.35)" }}
                        >
                            Analyze Resume
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
};

export default Upload;