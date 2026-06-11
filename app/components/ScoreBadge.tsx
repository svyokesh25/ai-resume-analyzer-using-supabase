const ScoreBadge = ({ score }: { score: number }) => {
    const badgeClass =
        score > 70
            ? "bg-green-100 text-green-700"
            : score > 49
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700";

    const label =
        score > 70
            ? "Strong"
            : score > 49
                ? "Good Start"
                : "Needs Work";

    return (
        <div className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
            {label}
        </div>
    );
};

export default ScoreBadge;