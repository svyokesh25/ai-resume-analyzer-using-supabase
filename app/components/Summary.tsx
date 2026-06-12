import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";
import type { Feedback } from "~/components/Details";

const Category = ({ title, score }: { title: string; score: number }) => {
    const textColor =
        score > 70
            ? "text-green-600"
            : score > 49
                ? "text-yellow-600"
                : "text-red-600";

    return (
        <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
            <div className="flex flex-col gap-2">
                <p className="text-lg font-medium text-gray-800">{title}</p>
                <ScoreBadge score={score} />
            </div>

            <p className="text-lg font-semibold text-gray-800">
                <span className={textColor}>{score}</span>/100
            </p>
        </div>
    );
};

const Summary = ({ feedback }: { feedback: Feedback }) => {
    const overallScore = feedback?.overallScore ?? 72;
    const toneAndStyleScore = feedback?.toneAndStyle?.score ?? 70;
    const contentScore = feedback?.content?.score ?? 65;
    const structureScore = feedback?.structure?.score ?? 80;
    const skillsScore = feedback?.skills?.score ?? 70;

    return (
        <div className="w-full rounded-2xl bg-white p-6 shadow-md border border-gray-200">
            <div className="flex items-center gap-6 border-b border-gray-200 pb-6">
                <ScoreGauge score={overallScore} />

                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Your Resume Score
                    </h2>
                    <p className="max-w-xs text-sm leading-5 text-gray-500">
                        This score is calculated based on the variables listed below.
                    </p>
                </div>
            </div>

            <div className="mt-2">
                <Category title="Tone & Style" score={toneAndStyleScore} />
                <Category title="Content" score={contentScore} />
                <Category title="Structure" score={structureScore} />
                <Category title="Skills" score={skillsScore} />
            </div>
        </div>
    );
};

export default Summary;