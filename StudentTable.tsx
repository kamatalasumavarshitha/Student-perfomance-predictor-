import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Student } from "@/lib/sample-data";

export function StudentTable({
  students,
  selectedId,
  onSelect,
}: {
  students: Student[];
  selectedId: string | null;
  onSelect: (s: Student) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      students.filter(
        (s) =>
          s.name.toLowerCase().includes(q.toLowerCase()) ||
          s.id.toLowerCase().includes(q.toLowerCase()),
      ),
    [students, q],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search students…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex-1 overflow-y-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-secondary/80 backdrop-blur">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2 font-medium">Student</th>
              <th className="px-3 py-2 font-medium">Cohort</th>
              <th className="px-3 py-2 text-right font-medium">Score</th>
              <th className="px-3 py-2 font-medium">Risk</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const isSel = s.id === selectedId;
              const riskClass =
                s.prediction.risk === "Low"
                  ? "text-success"
                  : s.prediction.risk === "Medium"
                    ? "text-warning-foreground"
                    : "text-danger";
              return (
                <tr
                  key={s.id}
                  onClick={() => onSelect(s)}
                  className={cn(
                    "cursor-pointer border-t border-border transition-colors hover:bg-accent/40",
                    isSel && "bg-primary/10 hover:bg-primary/15",
                  )}
                >
                  <td className="px-3 py-2">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.id}</div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{s.cohort}</td>
                  <td className="px-3 py-2 text-right font-display font-semibold tabular-nums">
                    {s.prediction.score}
                  </td>
                  <td className={cn("px-3 py-2 text-xs font-medium", riskClass)}>
                    {s.prediction.risk}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
