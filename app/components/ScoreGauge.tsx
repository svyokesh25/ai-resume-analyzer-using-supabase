import { useEffect, useRef, useState } from "react";

const ScoreGauge = ({ score = 75 }: { score: number }) => {
    const [pathLength, setPathLength] = useState(0);
    const pathRef = useRef<SVGPathElement>(null);

    const percentage = Math.max(0, Math.min(score, 100)) / 100;

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, []);

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative w-48 h-28">
                <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient
                            id="gaugeGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="#c084fc" />
                            <stop offset="100%" stopColor="#f9a8d4" />
                        </linearGradient>
                    </defs>

                    <path
                        d="M10,50 A40,40 0 0,1 90,50"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />

                    <path
                        ref={pathRef}
                        d="M10,50 A40,40 0 0,1 90,50"
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={pathLength}
                        strokeDashoffset={pathLength * (1 - percentage)}
                        style={{
                            transition: "stroke-dashoffset 0.8s ease",
                        }}
                    />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center pt-10">
                    <div className="text-base font-semibold text-gray-700">
                        {score}/100
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScoreGauge;