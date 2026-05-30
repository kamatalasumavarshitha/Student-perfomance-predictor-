import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const InputSchema = z.object({
  studentName: z.string().min(1).max(80),
  score: z.number().min(0).max(100),
  grade: z.string().max(2),
  risk: z.enum(["Low", "Medium", "High"]),
  topDrivers: z
    .array(z.object({ feature: z.string().max(40), contribution: z.number() }))
    .max(8),
  features: z.record(z.string().max(40), z.union([z.number(), z.boolean()])),
});

export const explainPrediction = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return {
        summary:
          "AI explanations are not configured. Showing rule-based insights based on the strongest feature contributions.",
        recommendations: data.topDrivers.slice(0, 3).map(
          (d) => `Focus on improving ${d.feature} — it's a key driver of the predicted outcome.`,
        ),
      };
    }
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const prompt = `You are an academic advisor AI. Given a student's predicted performance and the top feature contributions from an interpretable model, write:
1) A 2-sentence "summary" explaining WHY the model predicted this outcome, in plain language.
2) A list of 3 specific, actionable "recommendations" to improve performance. Each recommendation should reference the actual feature value when relevant.

Student: ${data.studentName}
Predicted score: ${data.score}/100 (Grade ${data.grade}, Risk: ${data.risk})
Top drivers (feature -> contribution to score):
${data.topDrivers.map((d) => `- ${d.feature}: ${d.contribution.toFixed(1)} pts`).join("\n")}
Raw features: ${JSON.stringify(data.features)}

Respond in this exact JSON shape (no markdown fences):
{"summary": "...", "recommendations": ["...", "...", "..."]}`;

    try {
      const { text } = await generateText({ model, prompt });
      const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
      const parsed = JSON.parse(cleaned) as {
        summary: string;
        recommendations: string[];
      };
      return {
        summary: parsed.summary,
        recommendations: parsed.recommendations.slice(0, 4),
      };
    } catch (err) {
      console.error("AI explanation error:", err);
      return {
        summary:
          "Could not generate AI explanation right now. Top feature contributions are shown below.",
        recommendations: data.topDrivers
          .slice(0, 3)
          .map((d) => `Improve ${d.feature} — it's currently a key driver.`),
      };
    }
  });
