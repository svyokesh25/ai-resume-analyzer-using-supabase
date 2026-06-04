import React from "react";

interface FileUploaderProps {
    id?: string;
    file: File | null;
    onFileSelect: (file: File | null) => void;
}

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileUploader = ({
                          id = "file-upload",
                          file,
                          onFileSelect,
                      }: FileUploaderProps): React.JSX.Element => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const selectedFile = e.target.files?.[0] ?? null;
        onFileSelect(selectedFile);
    };

    const handleRemove = (): void => {
        onFileSelect(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const openFilePicker = (): void => {
        inputRef.current?.click();
    };

    return (
        <div>
            <input
                id={id}
                ref={inputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleChange}
                style={{ display: "none" }}
            />

            {!file ? (
                <button
                    type="button"
                    onClick={openFilePicker}
                    style={{
                        width: "100%",
                        minHeight: "92px",
                        borderRadius: "16px",
                        border: "2px dashed #c4b5fd",
                        background: "#faf7ff",
                        color: "#6a5af9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: "8px",
                        cursor: "pointer",
                        padding: "16px",
                    }}
                >
                    <span style={{ fontSize: "24px" }}>📄</span>
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>
            Click to upload PDF or image
          </span>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
            PDF, JPG, PNG supported
          </span>
                </button>
            ) : (
                <div
                    style={{
                        width: "100%",
                        borderRadius: "16px",
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "10px",
                                background: "#f3f4f6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "18px",
                                flexShrink: 0,
                            }}
                        >
                            {file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
                                ? "📕"
                                : "🖼️"}
                        </div>

                        <div style={{ minWidth: 0 }}>
                            <div
                                style={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: "#111827",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                                title={file.name}
                            >
                                {file.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                {formatFileSize(file.size)}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleRemove}
                        style={{
                            border: "none",
                            background: "transparent",
                            color: "#6b7280",
                            cursor: "pointer",
                            fontSize: "18px",
                            lineHeight: 1,
                            padding: "4px 8px",
                            flexShrink: 0,
                        }}
                        aria-label="Remove selected file"
                        title="Remove file"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUploader;