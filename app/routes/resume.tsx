import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

export const meta = () => ([
    { title: "Resumind | Review" },
    { name: "description", content: "Detailed overview of your resume" },
]);

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState("");
    const [resumeUrl, setResumeUrl] = useState("");
    const [feedback, setFeedback] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const loadResume = async () => {
            if (!id) return;

            const resume = await kv.get(`resume:${id}`);
            if (!resume) return;

            const data = JSON.parse(resume);

            if (data.resumePath) {
                const resumeBlob = await fs.read(data.resumePath);
                if (resumeBlob) {
                    const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
                    const generatedResumeUrl = URL.createObjectURL(pdfBlob);
                    setResumeUrl(generatedResumeUrl);
                }
            }

            if (data.imagePath) {
                const imageBlob = await fs.read(data.imagePath);
                if (imageBlob) {
                    const generatedImageUrl = URL.createObjectURL(imageBlob);
                    setImageUrl(generatedImageUrl);
                }
            }

            setFeedback(data.feedback);
            console.log({ resumeUrl: data.resumePath, imageUrl: data.imagePath, feedback: data.feedback });
        };

        loadResume();
    }, [id, kv, fs]);

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
                        {imageUrl ? (
                            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={imageUrl}
                                        alt="resume preview"
                                        className="w-full h-full object-contain rounded-2xl"
                                        title="resume"
                                    />
                                </a>
                            </div>
                        ) : resumeUrl ? (
                            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 p-8 rounded-2xl bg-white">
                                <a
                                    href={resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 text-base font-semibold"
                                >
                                    Open Resume PDF
                                </a>
                            </div>
                        ) : null}
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