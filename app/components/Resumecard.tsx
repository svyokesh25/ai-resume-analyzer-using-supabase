import { Link } from "react-router";

const Resumecard = ({ resume }: { resume: Resume }) => {
    return (
        <Link to={`/resume/${resume.id}`} className="resume-card">
            <div className="card-header">
                <div>
                    <h3>{resume.companyName}</h3>
                    <p>{resume.jobTitle}</p>
                </div>
                <div className="score">
                    {resume.feedback.overallScore}/100
                </div>
            </div>
            <img
                src={resume.imagePath}
                alt={`${resume.companyName} resume`}
            />
        </Link>
    );
};

export default Resumecard;