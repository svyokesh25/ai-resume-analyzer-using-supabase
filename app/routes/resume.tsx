import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";

export const meta = () => ([
    { title: "Resumind | Review" },
    { name: "description", content: "Detailed overview of your resume" },
]);

const Resume = () => {
    const { id } = useParams();
    const [resumeUrl, setResumeUrl] = useState("");
    const [feedback, setFeedback] = useState<any>(null);

    useEffect(() => {
        if (!id) return;

        const resume = localStorage.getItem(`resume:${id}`);
        if (!resume) return;

        const data = JSON.parse(resume);
        setResumeUrl(data.resumeUrl || "");
        setFeedback(data.feedback || null);
    }, [id]);

    return (
        <div>
            <main className="!pt-0">
                <nav className="resume nav">
                    <Link to="/" className="back-button">
                        <img src="/icon/back.svg" alt="logo" className="w-2.5 h-2.5" />
                        <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                    </Link>
                </nav>

                <div className="flex flex-row w-full max-lg:flex-col-reverse">
                    <section className="feedback-sectionb bg-[url('/image/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                        {resumeUrl && (
                            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                                <iframe
                                    src={resumeUrl}
                                    title="resume"
                                    className="w-[800px] h-[1000px] rounded-2xl bg-white"
                                />
                            </div>
                        )}
                    </section>

                    <section className="feedback-section">
                        <h2 className="feedback-section-title">Resume Review</h2>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Resume;