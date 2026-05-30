import { predict, type StudentInput } from "./predict";

const NAMES = [
  "Aarav", "Maya", "Liam", "Sofia", "Noah", "Aisha", "Ethan", "Zara",
  "Lucas", "Priya", "Mason", "Chloe", "Kabir", "Emma", "Diego", "Yuki",
  "Omar", "Léa", "Nikhil", "Hana", "Isaac", "Mira", "Jonas", "Amara",
];

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export type Student = {
  id: string;
  name: string;
  cohort: "A" | "B" | "C";
  input: StudentInput;
  prediction: ReturnType<typeof predict>;
};

export function generateStudents(): Student[] {
  const r = rand(42);
  return NAMES.map((name, i) => {
    const cohort = (["A", "B", "C"] as const)[i % 3];
    const input: StudentInput = {
      attendance: 55 + r() * 45,
      studyHours: 4 + r() * 22,
      pastGpa: 4 + r() * 6,
      assignments: 50 + r() * 50,
      sleep: 5 + r() * 4,
      participation: r() * 10,
      tutoring: r() > 0.6,
      internetAccess: r() > 0.15,
    };
    return {
      id: `STU-${(1000 + i).toString()}`,
      name,
      cohort,
      input,
      prediction: predict(input),
    };
  });
}
