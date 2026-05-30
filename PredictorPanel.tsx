import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Sparkles, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { predict, type StudentInput, FEATURE_LABELS } from "@/lib/predict";
import { explainPrediction } from "@/lib/insights.functions";

const defaults: StudentInput = {
  attendance: 82,
  studyHours: 12,
  pastGpa: 7.4,
  assignments: 78,
  sleep: 7,
  participation: 6,
  tutoring: false,
  internetAccess: true,
};

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <span className="font-display text-sm font-semibold tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        className="mt-2"
      />
    </div>
  );
}

export function PredictorPanel({
  studentName = "this student",
  initial,
}: {
  studentName?: string;
  initial?: StudentInput;
}) {
  const [input, setInput] = useState<StudentInput>(initial ?? defaults);
  const result = useMemo(() => predict(input), [input]);

  const explainFn = useServerFn(explainPrediction);
  const explain = useMutation({
    mutationFn: () =>
      explainFn({
        data: {
          studentName,
          score: result.score,
          grade: result.grade,
          risk: result.risk,
          topDrivers: [...result.contributions]
            .sort((a, b) => b.contribution - a.contribution)
            .slice(0, 5)
            .map((c) => ({ feature: FEATURE_LABELS[c.feature] ?? c.feature, contribution: c.contribution })),
          features: Object.fromEntries(
            Object.entries(input).map(([k, v]) => [FEATURE_LABELS[k] ?? k, v]),
          ),
        },
      }),
  });

  const riskColor =
    result.risk === "Low"
      ? "bg-success/15 text-success border-success/30"
      : result.risk === "Medium"
        ? "bg-warning/20 text-warning-foreground border-warning/40"
        : "bg-danger/15 text-danger border-danger/30";
  const RiskIcon =
    result.risk === "Low" ? CheckCircle2 : result.risk === "Medium" ? TrendingUp : AlertTriangle;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-5">
        <NumberField
          label="Attendance"
          value={Math.round(input.attendance)}
          onChange={(v) => setInput({ ...input, attendance: v })}
          min={0}
          max={100}
          suffix="%"
        />
        <NumberField
          label="Study hours / week"
          value={Math.round(input.studyHours)}
          onChange={(v) => setInput({ ...input, studyHours: v })}
          min={0}
          max={40}
          suffix="h"
        />
        <NumberField
          label="Past GPA"
          value={Math.round(input.pastGpa * 10) / 10}
          onChange={(v) => setInput({ ...input, pastGpa: v })}
          min={0}
          max={10}
          step={0.1}
        />
        <NumberField
          label="On-time assignments"
          value={Math.round(input.assignments)}
          onChange={(v) => setInput({ ...input, assignments: v })}
          min={0}
          max={100}
          suffix="%"
        />
        <NumberField
          label="Sleep / night"
          value={Math.round(input.sleep * 10) / 10}
          onChange={(v) => setInput({ ...input, sleep: v })}
          min={3}
          max={10}
          step={0.5}
          suffix="h"
        />
        <NumberField
          label="Class participation"
          value={Math.round(input.participation)}
          onChange={(v) => setInput({ ...input, participation: v })}
          min={0}
          max={10}
          suffix="/10"
        />
        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-3">
          <Label className="text-sm">Tutoring support</Label>
          <Switch
            checked={input.tutoring}
            onCheckedChange={(c) => setInput({ ...input, tutoring: c })}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-3">
          <Label className="text-sm">Stable internet access</Label>
          <Switch
            checked={input.internetAccess}
            onCheckedChange={(c) => setInput({ ...input, internetAccess: c })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Predicted Score
              </p>
              <p className="mt-1 font-display text-6xl font-bold tabular-nums">
                {result.score}
                <span className="text-2xl text-muted-foreground">/100</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Grade</p>
              <p className="mt-1 font-display text-5xl font-bold text-primary">{result.grade}</p>
            </div>
          </div>
          <div
            className={cn(
              "mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium",
              riskColor,
            )}
          >
            <RiskIcon className="h-4 w-4" />
            {result.risk} risk
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
            Feature contributions
          </p>
          <div className="space-y-2">
            {[...result.contributions]
              .sort((a, b) => b.contribution - a.contribution)
              .map((c) => (
                <div key={c.feature}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{FEATURE_LABELS[c.feature] ?? c.feature}</span>
                    <span className="tabular-nums text-muted-foreground">
                      +{c.contribution.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(c.contribution / 22) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold">AI insights</p>
            <Button
              size="sm"
              onClick={() => explain.mutate()}
              disabled={explain.isPending}
            >
              {explain.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {explain.isPending ? "Thinking…" : "Explain & recommend"}
            </Button>
          </div>
          {explain.data ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm leading-relaxed text-foreground">{explain.data.summary}</p>
              <ul className="space-y-2">
                {explain.data.recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="flex gap-3 rounded-lg bg-secondary/60 p-3 text-sm leading-relaxed"
                  >
                    <span className="font-display text-primary">{i + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Generate a plain-language explanation of why this score was predicted, plus tailored
              recommendations for improvement.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
