import React from "react";
import { cn } from "~/lib/utils";

interface Suggestion {
    type: "good" | "warning";
    tip: string;
}

interface ATSProps {
    score: number;
    suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
    const gradientClass =
        score > 69
            ? "from-green-100"
            : score > 49
                ? "from-yellow-100"
                : "from-red-100";

    const iconSrc =
        score > 69
            ? "/icons/ats-good.svg"
            : score > 49
                ? "/icons/ats-warning.svg"
                : "/icons/ats-bad.svg";

    const subtitle =
        score > 69
            ? "Great Job!"
            : score > 49
                ? "Good Start"
                : "Needs Improvement";

    return (
        <div
            className={cn(
                "w-full rounded-2xl border border-gray-200 bg-gradient-to-b to-white p-6 shadow-sm",
                gradientClass
            )}
        >
            <div className="mb-5 flex items-center gap-4">
                <img src={iconSrc} alt="ATS Score Icon" className="h-12 w-12" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        ATS Score - {score}/100
                    </h2>
                    <p className="text-sm text-gray-600">{subtitle}</p>
                </div>
            </div>

            <p className="mb-5 text-sm leading-6 text-gray-600">
                This score represents how well your resume is likely to perform in Applicant
                Tracking Systems used by employers.
            </p>

            <div className="space-y-3">
                {suggestions.map((suggestion, index) => {
                    const isGood = suggestion.type === "good";

                    return (
                        <div key={index} className="flex items-start gap-3">
                            <img
                                src={isGood ? "/icons/check.svg" : "/icons/warning.svg"}
                                alt={isGood ? "Check" : "Warning"}
                                className="mt-0.5 h-5 w-5"
                            />
                            <p
                                className={cn(
                                    "text-sm leading-6",
                                    isGood ? "text-green-700" : "text-yellow-700"
                                )}
                            >
                                {suggestion.tip}
                            </p>
                        </div>
                    );
                })}
            </div>

            <p className="mt-5 text-sm italic text-gray-600">
                Keep refining your resume to improve your chances of getting past ATS filters and
                into the hands of recruiters.
            </p>
        </div>
    );
};

export default ATS;