import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";

type ResumeRow = {
    id: string;
    resume_path: string | null;
    image_path: string | null;
};

const WipeApp = () => {
    const navigate = useNavigate();
    const [files, setFiles] = useState<ResumeRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadFiles = async () => {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
            .from("resumes")
            .select("id, resume_path, image_path")
            .order("created_at", { ascending: false });

        if (error) {
            setError(error.message);
            setFiles([]);
        } else {
            setFiles(data || []);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        loadFiles();
    }, []);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            setError(null);

            const storagePaths = files.flatMap((file) =>
                [file.resume_path, file.image_path].filter(Boolean) as string[]
            );

            if (storagePaths.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from("resumes")
                    .remove(storagePaths);

                if (storageError) {
                    throw storageError;
                }
            }

            const { error: dbError } = await supabase
                .from("resumes")
                .delete()
                .not("id", "is", null);

            if (dbError) {
                throw dbError;
            }

            await loadFiles();
        } catch (err: any) {
            console.error("Failed to wipe app data:", err);
            setError(err?.message || "Failed to wipe app data.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6">
            {error && <div className="mb-4 text-red-600">Error: {error}</div>}

            <div className="mb-4 font-medium">Existing resume records:</div>

            <div className="flex flex-col gap-4 mb-6">
                {files.length > 0 ? (
                    files.map((file) => (
                        <div key={file.id} className="flex flex-col gap-1 rounded-md border p-3">
                            <p><strong>ID:</strong> {file.id}</p>
                            <p><strong>Resume path:</strong> {file.resume_path || "—"}</p>
                            <p><strong>Image path:</strong> {file.image_path || "—"}</p>
                        </div>
                    ))
                ) : (
                    <p>No resume data found.</p>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded-md cursor-pointer disabled:opacity-50"
                    onClick={handleDelete}
                    disabled={isDeleting || files.length === 0}
                >
                    {isDeleting ? "Wiping..." : "Wipe App Data"}
                </button>

                <button
                    className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md cursor-pointer"
                    onClick={() => navigate("/")}
                >
                    Back
                </button>
            </div>
        </div>
    );
};

export default WipeApp;