import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const selectedFile = acceptedFiles[0] || null;
            setFile(selectedFile);
            onFileSelect?.(selectedFile);
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            "application/pdf": [".pdf"],
            "application/msword": [".doc"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        },
        maxSize: 20 * 1024 * 1024,
    });

    const formatSize = (size: number) => {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        onFileSelect?.(null);
    };

    const isWord =
        file?.type === "application/msword" ||
        file?.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const dropzoneStyle: React.CSSProperties = {
        width: "100%",
        borderRadius: "16px",
        border: `2px dashed ${isDragActive ? "#6a5af9" : file ? "#a78bfa" : "#d1d5db"}`,
        background: isDragActive ? "#f5f3ff" : file ? "#faf5ff" : "#f9fafb",
        padding: file ? "16px" : "36px 24px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxSizing: "border-box",
    };

    return (
        <div {...getRootProps()} style={dropzoneStyle}>
            <input {...getInputProps()} />

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                {file ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#fff", borderRadius: "12px", padding: "12px 16px", border: "1px solid #e5e7eb", width: "100%", boxSizing: "border-box" }}>

                        {/* File type icon */}
                        {isWord ? (
                            <div style={{ width: "44px", height: "52px", borderRadius: "6px", background: "#dbeafe", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                                <span style={{ fontSize: "9px", fontWeight: 700, color: "#3b82f6", marginTop: "2px", letterSpacing: "0.5px" }}>DOC</span>
                            </div>
                        ) : (
                            <div style={{ width: "44px", height: "52px", borderRadius: "6px", background: "#fee2e2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                <span style={{ fontSize: "9px", fontWeight: 700, color: "#ef4444", marginTop: "2px", letterSpacing: "0.5px" }}>PDF</span>
                            </div>
                        )}

                        {/* File info */}
                        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {file.name}
                            </p>
                            <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#9ca3af" }}>
                                {formatSize(file.size)}
                            </p>
                        </div>

                        {/* Remove button */}
                        <button
                            onClick={handleRemove}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="24" height="24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: "14px", color: "#4b5563" }}>
                                <span style={{ fontWeight: 600, color: "#111" }}>Click to upload</span> or drag and drop
                            </p>
                            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9ca3af" }}>PDF or Word — max 20 MB</p>
                        </div>
                        {isDragActive && (
                            <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#6a5af9" }}>Drop it here!</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FileUploader;