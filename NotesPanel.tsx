import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2, Save, Trash2, NotebookPen, LogIn } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { getNote, saveNote, deleteNote } from "@/lib/student-notes.functions";

type Grade = "A" | "B" | "C" | "D" | "F";
type Risk = "Low" | "Medium" | "High";

export function NotesPanel({ studentId }: { studentId: string }) {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const getFn = useServerFn(getNote);
  const saveFn = useServerFn(saveNote);
  const delFn = useServerFn(deleteNote);

  const note = useQuery({
    queryKey: ["note", studentId, user?.id],
    queryFn: () => getFn({ data: { studentId } }),
    enabled: !!user,
  });

  const [text, setText] = useState("");
  const [score, setScore] = useState<string>("");
  const [grade, setGrade] = useState<Grade | "">("");
  const [risk, setRisk] = useState<Risk | "">("");

  useEffect(() => {
    if (note.data) {
      setText(note.data.note ?? "");
      setScore(note.data.override_score != null ? String(note.data.override_score) : "");
      setGrade((note.data.override_grade as Grade) ?? "");
      setRisk((note.data.override_risk as Risk) ?? "");
    } else if (note.isFetched) {
      setText("");
      setScore("");
      setGrade("");
      setRisk("");
    }
  }, [note.data, note.isFetched, studentId]);

  const save = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          studentId,
          note: text,
          overrideScore: score === "" ? null : Number(score),
          overrideGrade: grade === "" ? null : grade,
          overrideRisk: risk === "" ? null : risk,
        },
      }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["note", studentId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const remove = useMutation({
    mutationFn: () => delFn({ data: { studentId } }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["note", studentId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-5">
        <div className="flex items-center gap-2 text-sm">
          <NotebookPen className="h-4 w-4 text-primary" />
          <p className="font-display font-semibold">Educator notes & overrides</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to save private notes and override the predicted score, grade, or risk for this
          student.
        </p>
        <Button asChild size="sm" className="mt-4">
          <Link to="/login">
            <LogIn className="h-4 w-4" />
            Sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-primary" />
          <p className="font-display text-sm font-semibold">Educator notes & overrides</p>
        </div>
        {note.data ? (
          <span className="text-xs text-muted-foreground">
            Updated {new Date(note.data.updated_at).toLocaleString()}
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Notes</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add context, observations, or an action plan…"
            rows={4}
            className="mt-1.5 resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Override score</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="—"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Override grade</Label>
            <Select value={grade || undefined} onValueChange={(v) => setGrade(v as Grade)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {(["A", "B", "C", "D", "F"] as const).map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Override risk</Label>
            <Select value={risk || undefined} onValueChange={(v) => setRisk(v as Risk)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {(["Low", "Medium", "High"] as const).map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setScore("");
              setGrade("");
              setRisk("");
            }}
          >
            Clear overrides
          </Button>
          <div className="flex gap-2">
            {note.data ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => remove.mutate()}
                disabled={remove.isPending}
              >
                {remove.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              onClick={() => save.mutate()}
              disabled={save.isPending}
            >
              {save.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
