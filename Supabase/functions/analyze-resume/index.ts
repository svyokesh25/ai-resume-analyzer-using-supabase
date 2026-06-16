// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface ResumeRequest {
    resumeText: string;
    jobTitle: string;
    jobDescription: string;
}

interface ATSTip {
    type: "good" | "warning";
    tip: string;
}

interface DetailedTip {
    type: "good" | "improve";
    tip: string;
    explanation: string;
}

interface FeedbackCategory {
    score: number;
    tips: DetailedTip[];
}

interface ResumeFeedback {
    overallScore: number;
    summary: string;
    atsScore: number;
    atsTips: ATSTip[];
    toneAndStyle: FeedbackCategory;
    content: FeedbackCategory;
    structure: FeedbackCategory;
    skills: FeedbackCategory;
}

Deno.serve(async (req: Request): Promise<Response> => {
    try {
        const { resumeText, jobTitle, jobDescription } = (await req.json()) as ResumeRequest;

        if (!resumeText || !jobDescription) {
            return new Response(
                JSON.stringify({
                    error: "resumeText and jobDescription are required.",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

        if (!OPENAI_API_KEY) {
            return new Response(
                JSON.stringify({
                    error: "Missing OPENAI_API_KEY secret.",
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const prompt = `
You are an expert ATS and resume reviewer.
Analyze the resume against the target job.

Be strict and realistic.
Do not inflate scores.
If the resume is weak, give low scores.
Use the job title and job description when judging relevance.

Return ONLY valid JSON.
Do not include markdown.
Do not include backticks.
Do not include any text before or after the JSON.

Use this exact JSON shape:
{
  "overallScore": 0,
  "summary": "",
  "atsScore": 0,
  "atsTips": [
    { "type": "good", "tip": "" },
    { "type": "warning", "tip": "" }
  ],
  "toneAndStyle": {
    "score": 0,
    "tips": [
      { "type": "good", "tip": "", "explanation": "" },
      { "type": "improve", "tip": "", "explanation": "" }
    ]
  },
  "content": {
    "score": 0,
    "tips": [
      { "type": "good", "tip": "", "explanation": "" },
      { "type": "improve", "tip": "", "explanation": "" }
    ]
  },
  "structure": {
    "score": 0,
    "tips": [
      { "type": "good", "tip": "", "explanation": "" },
      { "type": "improve", "tip": "", "explanation": "" }
    ]
  },
  "skills": {
    "score": 0,
    "tips": [
      { "type": "good", "tip": "", "explanation": "" },
      { "type": "improve", "tip": "", "explanation": "" }
    ]
  }
}

Scoring rules:
- 0 to 30 = poor fit
- 31 to 50 = weak fit
- 51 to 70 = moderate fit
- 71 to 85 = strong fit
- 86 to 100 = excellent fit

Job title:
${jobTitle ?? ""}

Job description:
${jobDescription}

Resume text:
${resumeText}
`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                temperature: 0.2,
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: "You are a strict resume analysis assistant. Return only valid JSON.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return new Response(JSON.stringify({ error: data }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const content = data.choices?.[0]?.message?.content as string;

        let parsedFeedback: ResumeFeedback;
        try {
            parsedFeedback = JSON.parse(content);
        } catch {
            return new Response(
                JSON.stringify({ error: "Invalid JSON response from OpenAI" }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        return new Response(JSON.stringify(parsedFeedback), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        return new Response(
            JSON.stringify({
                error: errorMessage,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
});