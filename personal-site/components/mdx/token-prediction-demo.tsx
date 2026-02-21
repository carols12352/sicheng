"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useAppReducedMotion } from "@/hooks/use-app-reduced-motion";

type DemoStage = {
  id: string;
  title: string;
  context: string;
  candidates: Array<{ token: string; prob: number }>;
};

const STAGES: DemoStage[] = [
  {
    id: "local",
    title: "1. Weak Local Cue",
    context: "Context: Let f(x) = x^2 + 3x. Then f'(x) =",
    candidates: [
      { token: "2x", prob: 0.38 },
      { token: "x^2", prob: 0.22 },
      { token: "3", prob: 0.16 },
      { token: "None", prob: 0.08 },
    ],
  },
  {
    id: "syntax",
    title: "2. With Syntax + Math Pattern",
    context: "Model recognizes derivative format and polynomial rule structure.",
    candidates: [
      { token: "2x", prob: 0.55 },
      { token: "+", prob: 0.2 },
      { token: "3", prob: 0.14 },
      { token: "x^2", prob: 0.05 },
    ],
  },
  {
    id: "global",
    title: "3. With Global Constraint",
    context: "Combined context implies full continuation should be 2x + 3.",
    candidates: [
      { token: "2x", prob: 0.68 },
      { token: "+", prob: 0.21 },
      { token: "3", prob: 0.08 },
      { token: "x^2", prob: 0.01 },
    ],
  },
];

export function TokenPredictionDemo() {
  const [stageIndex, setStageIndex] = useState(0);
  const reduceMotion = useAppReducedMotion();
  const stage = STAGES[stageIndex];
  const max = useMemo(
    () => Math.max(...stage.candidates.map((item) => item.prob), 0.01),
    [stage.candidates],
  );

  return (
    <figure className="terminal-demo">
      <figcaption className="terminal-demo-head">Prediction Distribution Shift</figcaption>
      <div className="px-4 py-4">
        <div className="flex flex-wrap gap-2">
          {STAGES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStageIndex(index)}
               
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  stageIndex === index
                    ? "border-gray-400 text-gray-900"
                  : "border-gray-200 text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-gray-600">{stage.context}</p>

        <ul className="mt-4 m-0 space-y-2 p-0">
          {stage.candidates.map((item) => (
            <li key={item.token} className="list-none">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                <span className="font-mono">{item.token}</span>
                <span>{Math.round(item.prob * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded bg-gray-100">
                <motion.div
                  className="h-2 rounded bg-gray-400"
                  style={reduceMotion ? { width: `${(item.prob / max) * 100}%` } : undefined}
                  animate={reduceMotion ? undefined : { width: `${(item.prob / max) * 100}%` }}
                  transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
