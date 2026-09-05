import * as z from "zod";

const roastLineSchema = z.object({
  headline: z.string().min(1).max(200),
  detail: z.string().min(1).max(500),
});

const criticalIssueSchema = z.object({
  title: z.string().min(1).max(200),
  desc: z.string().min(1).max(500),
  severity: z.enum(["CRITICAL", "WARNING", "HIGH"]),
});

const elementGradeSchema = z.object({
  label: z.string().min(1).max(60),
  score: z.number().int().min(0).max(100),
});

const actionFixSchema = z.object({
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM"]),
  title: z.string().min(1).max(200),
  copy: z.string().max(500),
  code: z.string().min(1).max(1000),
});

/**
 * Validates the JSON Gemini returns for a roast, matching the shape
 * requested in src/Infrastructure/Services/LlmPrompts.ts. Bounded array
 * lengths so a malformed or oversized response can't break the fixed-layout
 * UI it's rendered into. One AI call produces both the quick-preview fields
 * (score/strengths/criticalIssues/roastLines/rewrittenHeroCopy) and the
 * extra fields the full report page needs (elementGrades/actionFixes) —
 * avoids a second model call when a user drills into the full report.
 */
export const roastResultSchema = z.object({
  score: z.number().int().min(0).max(100),
  strengths: z.array(roastLineSchema).min(1).max(6),
  criticalIssues: z.array(criticalIssueSchema).min(1).max(6),
  roastLines: z.array(roastLineSchema).min(1).max(6),
  rewrittenHeroCopy: z.string().min(1).max(1000),
  elementGrades: z.array(elementGradeSchema).min(3).max(6),
  actionFixes: z.array(actionFixSchema).min(1).max(4),
});

export type RoastResult = z.infer<typeof roastResultSchema>;
