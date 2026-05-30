import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Student } from "@/lib/sample-data";

export function GradeDistribution({ students }: { students: Student[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    students.forEach((s) => (counts[s.prediction.grade] = (counts[s.prediction.grade] ?? 0) + 1));
    return Object.entries(counts).map(([grade, count]) => ({ grade, count }));
  }, [students]);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="grade" tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" />
        <YAxis tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" />
        <Tooltip
          cursor={{ fill: "var(--color-secondary)" }}
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="var(--color-primary)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RiskPie({ students }: { students: Student[] }) {
  const data = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0 };
    students.forEach((s) => (counts[s.prediction.risk] += 1));
    return [
      { name: "Low", value: counts.Low, color: "var(--color-success)" },
      { name: "Medium", value: counts.Medium, color: "var(--color-warning)" },
      { name: "High", value: counts.High, color: "var(--color-danger)" },
    ];
  }, [students]);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={45}
          outerRadius={72}
          paddingAngle={3}
          stroke="var(--color-card)"
          strokeWidth={2}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            fontSize: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CohortCompare({ students }: { students: Student[] }) {
  const data = useMemo(() => {
    const groups: Record<string, number[]> = { A: [], B: [], C: [] };
    students.forEach((s) => groups[s.cohort].push(s.prediction.score));
    return Object.entries(groups).map(([cohort, scores]) => ({
      cohort: `Cohort ${cohort}`,
      avg: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
    }));
  }, [students]);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="cohort" tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" />
        <YAxis tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" domain={[0, 100]} />
        <Tooltip
          cursor={{ fill: "var(--color-secondary)" }}
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Bar dataKey="avg" radius={[8, 8, 0, 0]} fill="var(--color-chart-5)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FeatureImportance() {
  const data = [
    { feature: "Attendance", weight: 22 },
    { feature: "Past GPA", weight: 20 },
    { feature: "Study Hours", weight: 18 },
    { feature: "Assignments", weight: 18 },
    { feature: "Sleep", weight: 8 },
    { feature: "Participation", weight: 8 },
    { feature: "Tutoring", weight: 3 },
    { feature: "Internet", weight: 3 },
  ];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" />
        <YAxis
          type="category"
          dataKey="feature"
          tickLine={false}
          axisLine={false}
          width={90}
          stroke="var(--color-muted-foreground)"
          fontSize={12}
        />
        <Tooltip
          cursor={{ fill: "var(--color-secondary)" }}
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Bar dataKey="weight" radius={[0, 8, 8, 0]} fill="var(--color-primary)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
