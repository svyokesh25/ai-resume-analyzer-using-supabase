import React from "react";
import { cn } from "~/lib/utils";
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionItem,
} from "./Accordion";

export type Tip = {
    type: "good" | "improve";
    tip: string;
    explanation: string;
};

export type FeedbackCategory = {
    score: number;
    tips: Tip[];
};

export type Feedback = {
    overallScore: number;
    toneAndStyle: FeedbackCategory;
    content: FeedbackCategory;
    structure: FeedbackCategory;
    skills: FeedbackCategory;
    atsScore: number;
    atsTips: {
        type: "good" | "warning";
        tip: string;
    }[];
    summary?: string;
};

const ScoreBadge = ({ score }: { score: number }) => {
    const isGood = score > 69;
    const isAverage = score > 39 && score <= 69;

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1",
                isGood
                    ? "bg-green-100"
                    : isAverage
                        ? "bg-yellow-100"
                        : "bg-red-100"
            )}
        >
            <img
                src={isGood ? "/icons/check.svg" : "/icons/warning.svg"}
                alt="score"
                className="size-3.5"
            />
            <span
                className={cn(
                    "text-xs font-semibold",
                    isGood
                        ? "text-green-700"
                        : isAverage
                            ? "text-yellow-700"
                            : "text-red-700"
                )}
            >
                {score}/100
            </span>
        </div>
    );
};

const CategoryHeader = ({
                            title,
                            categoryScore,
                        }: {
    title: string;
    categoryScore: number;
}) => {
    return (
        <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <ScoreBadge score={categoryScore} />
        </div>
    );
};

const CategoryContent = ({ tips }: { tips: Tip[] }) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {tips.map((tip, index) => (
                    <div key={`${tip.tip}-${index}`} className="flex items-center gap-2">
                        <img
                            src={tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                            alt={tip.type}
                            className="size-4"
                        />
                        <p className="text-sm text-gray-700">{tip.tip}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3">
                {tips.map((tip, index) => (
                    <div
                        key={`${tip.tip}-${index}-box`}
                        className={cn(
                            "rounded-xl border p-4",
                            tip.type === "good"
                                ? "border-green-200 bg-green-50"
                                : "border-yellow-200 bg-yellow-50"
                        )}
                    >
                        <div className="mb-2 flex items-center gap-2">
                            <img
                                src={tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                                alt={tip.type}
                                className="size-4"
                            />
                            <p
                                className={cn(
                                    "text-sm font-semibold",
                                    tip.type === "good" ? "text-green-700" : "text-yellow-700"
                                )}
                            >
                                {tip.tip}
                            </p>
                        </div>

                        <p
                            className={cn(
                                "text-sm leading-6",
                                tip.type === "good" ? "text-green-800" : "text-yellow-800"
                            )}
                        >
                            {tip.explanation}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Details = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div className="w-full">
            <Accordion defaultOpen="" className="space-y-3">
                <AccordionItem id="tone-style">
                    <AccordionHeader itemId="tone-style">
                        <CategoryHeader
                            title="Tone & Style"
                            categoryScore={feedback.toneAndStyle.score}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="tone-style">
                        <CategoryContent tips={feedback.toneAndStyle.tips} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem id="content">
                    <AccordionHeader itemId="content">
                        <CategoryHeader
                            title="Content"
                            categoryScore={feedback.content.score}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="content">
                        <CategoryContent tips={feedback.content.tips} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem id="structure">
                    <AccordionHeader itemId="structure">
                        <CategoryHeader
                            title="Structure"
                            categoryScore={feedback.structure.score}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="structure">
                        <CategoryContent tips={feedback.structure.tips} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem id="skills">
                    <AccordionHeader itemId="skills">
                        <CategoryHeader
                            title="Skills"
                            categoryScore={feedback.skills.score}
                        />
                    </AccordionHeader>
                    <AccordionContent itemId="skills">
                        <CategoryContent tips={feedback.skills.tips} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default Details;