import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SaveInput = z.object({
  studentId: z.string().min(1).max(64),
  note: z.string().max(4000).default(""),
  overrideScore: z.number().min(0).max(100).nullable().optional(),
  overrideGrade: z.enum(["A", "B", "C", "D", "F"]).nullable().optional(),
  overrideRisk: z.enum(["Low", "Medium", "High"]).nullable().optional(),
});

export const listMyNotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("student_notes")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { studentId: string }) =>
    z.object({ studentId: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("student_notes")
      .select("*")
      .eq("student_id", data.studentId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const saveNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("student_notes")
      .upsert(
        {
          user_id: userId,
          student_id: data.studentId,
          note: data.note,
          override_score: data.overrideScore ?? null,
          override_grade: data.overrideGrade ?? null,
          override_risk: data.overrideRisk ?? null,
        },
        { onConflict: "user_id,student_id" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { studentId: string }) =>
    z.object({ studentId: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("student_notes")
      .delete()
      .eq("student_id", data.studentId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
