import { Link } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "~/lib/supabase";

type Resume = {
    id: string;
    companyName: string;
    jobTitle: string;
    imagePath: string;
    feedback: {
        overallScore: number;
    };
};

const Resumecard = ({ resume }: { resume: Resume }) => {
    const [resumeImageUrl, setResumeImageUrl] = useState("");

    useEffect(() => {
        if (!resume?.imagePath) return;

        const { data } = supabase.storage
            .from("resumes")
            .getPublicUrl(resume.imagePath);

        setResumeImageUrl(data.publicUrl);
    }, [resume?.imagePath]);

    return (
        <Link to={`/resume/${resume.id}`} className="resume-card">
            <div className="card-header">
                <div>
                    <h3>{resume.companyName}</h3>
                    <p>{resume.jobTitle}</p>
                </div>

                <div className="score">
                    {resume.feedback?.overallScore ?? 0}/100
                </div>
            </div>

            {resumeImageUrl ? (
                <img
                    src={resumeImageUrl}
                    alt={`${resume.companyName} resume`}
                />
            ) : (
                <div className="flex h-64 w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
                    Preview not available
                </div>
            )}
        </Link>
    );
};

export default Resumecard;