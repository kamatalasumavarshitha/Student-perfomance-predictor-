// Client-side heuristic "model" for student performance prediction.
// Weights are interpretable, normalized contributions toward a 0–100 score.

export type StudentInput = {
  attendance: number; // 0–100 (%)
  studyHours: number; // hours / week
  pastGpa: number; // 0–10
  assignments: number; // 0–100 (% submitted on time)
  sleep: number; // hours / night
  participation: number; // 0–10
  tutoring: boolean;
  internetAccess: boolean;
};

export const FEATURE_WEIGHTS: Record<keyof Omit<StudentInput, "tutoring" | "internetAccess">, number> & {
  tutoring: number;
  internetAccess: number;
} = {
  attendance: 0.22,
  studyHours: 0.18,
  pastGpa: 0.2,
  assignments: 0.18,
  sleep: 0.08,
  participation: 0.08,
  tutoring: 0.03,
  internetAccess: 0.03,
};

function clamp(n: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n));
}

export function featureContributions(input: StudentInput) {
  const n = {
    attendance: clamp(input.attendance / 100),
    studyHours: clamp(input.studyHours / 30),
    pastGpa: clamp(input.pastGpa / 10),
    assignments: clamp(input.assignments / 100),
    sleep: clamp(input.sleep / 9),
    participation: clamp(input.participation / 10),
    tutoring: input.tutoring ? 1 : 0,
    internetAccess: input.internetAccess ? 1 : 0,
  };
  return Object.entries(FEATURE_WEIGHTS).map(([key, weight]) => {
    const value = n[key as keyof typeof n];
    return {
      feature: key,
      weight,
      normalized: value,
      contribution: value * weight * 100,
    };
  });
}

export function predict(input: StudentInput) {
  const contribs = featureContributions(input);
  const score = contribs.reduce((s, c) => s + c.contribution, 0);
  const grade =
    score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "F";
  const risk: "Low" | "Medium" | "High" = score >= 70 ? "Low" : score >= 50 ? "Medium" : "High";
  return { score: Math.round(score * 10) / 10, grade, risk, contributions: contribs };
}

export const FEATURE_LABELS: Record<string, string> = {
  attendance: "Attendance",
  studyHours: "Study Hours",
  pastGpa: "Past GPA",
  assignments: "On-time Assignments",
  sleep: "Sleep",
  participation: "Class Participation",
  tutoring: "Tutoring Support",
  internetAccess: "Internet Access",
};
