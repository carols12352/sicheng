"use client";

import { useMemo, useState } from "react";

type FrameMode = "distance" | "physical";

const QUESTION = "If a car wash is 50 meters away, would you walk or drive?";

function confidenceAnswer(level: number): string {
  if (level <= 30) {
    return "I might be missing context, but based only on distance I'd lean toward walking.";
  }
  if (level <= 70) {
    return "Given it's only 50 meters, I'd probably say walking makes more sense.";
  }
  return "Given the short distance, walking is the better choice.";
}

export function HallucinationFrameSwitcherDemo() {
  const [frame, setFrame] = useState<FrameMode>("distance");

  const trace =
    frame === "distance"
      ? [
        "Detect primary signal: distance = 50m",
        "Apply common pattern: short distance -> walk",
        "Underweight hidden task constraint: car must be present",
      ]
      : [
        "Parse task intent: wash car at a car-wash location",
        "Apply physical constraint: no car, no wash",
        "Then evaluate distance as secondary factor",
      ];

  const answer =
    frame === "distance"
      ? "Walking seems better because 50 meters is very short."
      : "Drive the car there first, because the service requires the car to be physically present.";

  return (
    <figure className="terminal-demo hallucination-demo">
      <figcaption className="terminal-demo-head">Frame Switcher</figcaption>
      <div className="px-4 py-4">
        <p className="m-0 text-xs hallucination-demo-muted">{QUESTION}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFrame("distance")}
           
            className={`hallucination-demo-pill rounded-full border px-2.5 py-1 text-xs ${
              frame === "distance" ? "hallucination-demo-pill-active" : ""
            }`}
          >
            Distance optimization frame
          </button>
          <button
            type="button"
            onClick={() => setFrame("physical")}
           
            className={`hallucination-demo-pill rounded-full border px-2.5 py-1 text-xs ${
              frame === "physical" ? "hallucination-demo-pill-active" : ""
            }`}
          >
            Physical constraint frame
          </button>
        </div>
        <div className="hallucination-demo-card mt-4 rounded-md border px-3 py-2">
          <p className="hallucination-demo-label m-0 text-[11px] uppercase tracking-[0.08em]">Model output</p>
          <p className="hallucination-demo-body m-0 mt-1 text-sm">{answer}</p>
        </div>
        <div className="hallucination-demo-subcard mt-3 rounded-md border px-3 py-2">
          <p className="hallucination-demo-label m-0 text-[11px] uppercase tracking-[0.08em]">Reasoning Trace (Simulated)</p>
          <ol className="hallucination-demo-muted mt-2 m-0 list-decimal pl-5 text-xs [&>li]:my-1">
            {trace.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </figure>
  );
}

export function HallucinationConfidenceTruthDemo() {
  const [confidence, setConfidence] = useState(75);

  const answer = useMemo(() => confidenceAnswer(confidence), [confidence]);

  return (
    <figure className="terminal-demo hallucination-demo">
      <figcaption className="terminal-demo-head">Confidence vs Truth Meter</figcaption>
      <div className="px-4 py-4">
        <p className="m-0 text-xs hallucination-demo-muted">{QUESTION}</p>
        <div className="mt-4">
          <div className="hallucination-demo-muted mb-1 flex items-center justify-between text-xs">
            <span>Confidence tone</span>
            <span className="font-mono">{confidence}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={confidence}
            onChange={(event) => setConfidence(Number(event.currentTarget.value))}
            className="w-full accent-gray-500"
           
          />
        </div>
        <div className="hallucination-demo-card mt-4 rounded-md border px-3 py-2">
          <p className="hallucination-demo-label m-0 text-[11px] uppercase tracking-[0.08em]">Model output</p>
          <p className="hallucination-demo-body m-0 mt-1 text-sm">{answer}</p>
        </div>
        <div className="hallucination-demo-subcard mt-3 flex items-center justify-between rounded-md border px-3 py-2">
          <span className="hallucination-demo-muted text-xs">Truth status</span>
          <span className="text-xs font-semibold text-red-600">Still wrong even when confident</span>
        </div>
      </div>
    </figure>
  );
}

export function HallucinationGroundingToggleDemo() {
  const [grounded, setGrounded] = useState(false);

  const toolsCalled = grounded ? ["retriever.search", "constraint.checker", "planner.reason"] : [];

  const answer = grounded
    ? "I checked the task constraints first: the car must be at the wash location, so driving the car there is required."
    : "Given only the surface cue (50m), I'd answer: walk.";

  return (
    <figure className="terminal-demo hallucination-demo">
      <figcaption className="terminal-demo-head">Grounding Toggle (RAG / Tools)</figcaption>
      <div className="px-4 py-4">
        <div className="hallucination-demo-subcard flex items-center justify-between rounded-md border px-3 py-2">
          <div>
            <p className="hallucination-demo-label m-0 text-[11px] uppercase tracking-[0.08em]">Mode</p>
            <p className="hallucination-demo-muted m-0 mt-1 text-xs">
              {grounded ? "With tools (check first)" : "No tools (pure generation)"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setGrounded((value) => !value)}
           
            className="hallucination-demo-pill rounded-full border px-2.5 py-1 text-xs"
          >
            {grounded ? "With tools" : "No tools"}
          </button>
        </div>

        {grounded ? (
          <>
            <div className="hallucination-demo-subcard mt-3 rounded-md border px-3 py-2">
              <p className="hallucination-demo-label m-0 text-[11px] uppercase tracking-[0.08em]">Tool Calls</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {toolsCalled.map((tool) => (
                  <code key={tool} className="hallucination-demo-chip rounded border px-2 py-0.5 text-[11px]">
                    {tool}
                  </code>
                ))}
              </div>
            </div>
            <ol className="hallucination-demo-muted mt-3 m-0 list-decimal pl-5 text-xs [&>li]:my-1">
              <li>Retrieve context about what the service requires.</li>
              <li>Validate constraint: washing requires the car itself on site.</li>
              <li>Generate answer after constraint validation.</li>
            </ol>
          </>
        ) : null}

        <div className="hallucination-demo-card mt-4 rounded-md border px-3 py-2">
          <p className="hallucination-demo-label m-0 text-[11px] uppercase tracking-[0.08em]">Model output</p>
          <p className="hallucination-demo-body m-0 mt-1 text-sm">{answer}</p>
        </div>
      </div>
    </figure>
  );
}
