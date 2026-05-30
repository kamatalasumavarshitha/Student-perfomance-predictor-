import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Brain, GraduationCap, TrendingUp, Users } from "lucide-react";

import { PredictorPanel } from "@/components/PredictorPanel";
import { StudentTable } from "@/components/StudentTable";
import { NotesPanel } from "@/components/NotesPanel";
import { AuthMenu } from "@/components/AuthMenu";
import {
  CohortCompare,
  FeatureImportance,
  GradeDistribution,
  RiskPie,
} from "@/components/Charts";
import { generateStudents } from "@/lib/sample-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Performance Predictor" },
      {
        name: "description",
        content:
          "ML-powered dashboard to predict student academic performance, analyze cohorts, and generate AI-driven recommendations.",
      },
      { property: "og:title", content: "Student Performance Predictor" },
      {
        property: "og:description",
        content:
          "Predict student performance, explore feature importance, and get AI-powered improvement recommendations.",
      },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Brain;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Dashboard() {
  const students = useMemo(() => generateStudents(), []);
  const [selected, setSelected] = useState(students[0]);

  const stats = useMemo(() => {
    const n = students.length;
    const avg = students.reduce((s, x) => s + x.prediction.score, 0) / n;
    const atRisk = students.filter((s) => s.prediction.risk !== "Low").length;
    const passing = students.filter((s) => s.prediction.grade !== "F").length;
    return {
      total: n,
      avg: Math.round(avg * 10) / 10,
      atRisk,
      passRate: Math.round((passing / n) * 100),
    };
  }, [students]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary p-2 text-primary-foreground shadow-[var(--shadow-glow)]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold leading-tight">
                Student Performance Predictor
              </h1>
              <p className="text-xs text-muted-foreground">
                ML insights · cohort analytics · AI recommendations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground md:flex">
              <span className="h-2 w-2 rounded-full bg-success" />
              Model live · interpretable v1
            </div>
            <AuthMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {/* KPI row */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Students" value={String(stats.total)} hint="In current dataset" />
          <StatCard icon={TrendingUp} label="Avg. predicted score" value={`${stats.avg}`} hint="out of 100" />
          <StatCard
            icon={Brain}
            label="At-risk students"
            value={String(stats.atRisk)}
            hint="Medium or high risk"
          />
          <StatCard icon={GraduationCap} label="Pass rate" value={`${stats.passRate}%`} hint="Predicted ≥ D" />
        </section>

        {/* Bento grid */}
        <section className="grid gap-4 lg:grid-cols-6 lg:grid-rows-[auto_auto]">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              Grade distribution
            </p>
            <GradeDistribution students={students} />
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              Risk breakdown
            </p>
            <RiskPie students={students} />
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              Cohort comparison (avg. score)
            </p>
            <CohortCompare students={students} />
          </div>

          <div className="lg:col-span-2 lg:row-span-2 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="font-display text-sm font-semibold">Students</p>
              <p className="text-xs text-muted-foreground">Click to load into predictor</p>
            </div>
            <div className="h-[calc(100%-2rem)] min-h-[420px]">
              <StudentTable
                students={students}
                selectedId={selected?.id ?? null}
                onSelect={setSelected}
              />
            </div>
          </div>

          <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              Global feature importance
            </p>
            <FeatureImportance />
          </div>
        </section>

        {/* Predictor */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-5 flex items-baseline justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Interactive predictor
              </p>
              <h2 className="font-display text-2xl font-bold">
                {selected?.name ?? "New student"}
              </h2>
            </div>
            {selected ? (
              <p className="text-sm text-muted-foreground">
                {selected.id} · Cohort {selected.cohort}
              </p>
            ) : null}
          </div>
          <PredictorPanel
            key={selected?.id ?? "new"}
            studentName={selected?.name ?? "New student"}
            initial={selected?.input}
          />
          {selected ? (
            <div className="mt-5">
              <NotesPanel studentId={selected.id} />
            </div>
          ) : null}
        </section>

        <footer className="pb-6 pt-2 text-center text-xs text-muted-foreground">
          Built with Lovable AI · interpretable weights · educational use
        </footer>
      </main>
    </div>
  );
}
