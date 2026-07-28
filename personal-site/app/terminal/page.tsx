"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, SubmitEvent } from "react";
import TerminalEasterEgg, { type EasterEggVariant } from "./terminal-easter-eggs";
import styles from "./terminal.module.css";

type Tone = "default" | "muted" | "accent" | "warning" | "error" | "success";
type Difficulty = "hard" | "easy";
type EasterEggId =
  | "neofetch"
  | "fortune"
  | "sl"
  | "cat"
  | "matrix"
  | "coffee"
  | "rickroll"
  | "kernel";
type TerminalLine = { id: string; text: string; tone?: Tone; prompt?: string; preserve?: boolean };
type GuiEntry = {
  name: string;
  kind: "folder" | "file" | "process";
  size: string;
  modified: string;
  status?: "normal" | "warning" | "success";
  locked?: boolean;
};
type FileGlyphKind = GuiEntry["kind"] | "shortcut";
type ShellSession = {
  id: number;
  cwd: string;
  input: string;
  lines: TerminalLine[];
  history: string[];
  historyIndex: number | null;
  historyDraft: string;
  awaitingPassword: boolean;
  guiPath: string;
  guiSelected: string | null;
};

const PID = "7319";
const PASSWORD = "silent-process";
const ENCODED_KEY = "c2lsZW50LXByb2Nlc3M=";
const MISSION_STEP_COUNT = 6;
const EASTER_EGG_IDS: EasterEggId[] = [
  "neofetch",
  "cat",
  "fortune",
  "sl",
  "matrix",
  "coffee",
  "rickroll",
  "kernel",
];
const EASTER_EGG_COUNT = EASTER_EGG_IDS.length;
const ARTIFACT_HINTS: Record<EasterEggId, readonly [string, string]> = {
  neofetch: ["Index match · /srv/app/README.md", "Field match · host inventory"],
  cat: ["Index match · /srv/app/README.md", "Field match · standard-input probe"],
  fortune: ["Index match · /srv/app/experience/", "Record match · oncall-notes.txt"],
  sl: ["Index match · /srv/app/projects/", "Record match · railway-test.txt"],
  matrix: ["Index match · /srv/app/logs/", "Record match · display.channel"],
  coffee: ["Index match · /var/tmp/", "Record match · coffee.order"],
  rickroll: ["Index match · /srv/app/", "Record match · media shortcut"],
  kernel: ["Index match · hidden app metadata", "Record match · .bash_history"],
};
const CONFETTI_COLORS = ["#8fcf9b", "#79b8bd", "#d7ad66", "#e3837b", "#dce1de"];
const CONFETTI_PIECES = Array.from({ length: 44 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 101}%`,
  delay: `${-((index * 13) % 24) / 10}s`,
  duration: `${2.8 + ((index * 7) % 18) / 10}s`,
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
}));
const ROOT_ITEMS = ["srv/", "var/", "proc/", "home/"];
const GUI_DIRECTORY_PATHS = [
  "/",
  "/srv",
  "/srv/app",
  "/srv/app/.incident",
  "/srv/app/logs",
  "/srv/app/experience",
  "/srv/app/projects",
  "/proc",
  "/proc/1",
  "/proc/412",
  "/proc/642",
  `/proc/${PID}`,
  "/proc/8021",
  "/var",
  "/var/tmp",
  "/home",
  "/home/guest",
];
const APP_ITEMS = [
  "README.md", "package.json", "logs/", "experience/", "projects/",
  "resume.pdf", "about.txt", "contact.txt", "definitely-not-a-rickroll.url", ".incident/",
];
const COMMANDS = [
  "help", "ls", "ls -la", "pwd", "cd", "cat", "ps aux", "status",
  "history", "clear", "whoami", "uname -a", "sudo kill", "open home",
  "neofetch", "fortune", "matrix",
];
const FORTUNES = [
  "Observability turns unknown failure into bounded evidence.",
  "A clean rollback is a feature, not an admission.",
  "The first useful log line is the one that changes the next action.",
  "Reliable systems fail loudly, recover predictably, and explain why.",
  "Measure twice. Restart once.",
];

function FileGlyph({ kind, name, compact = false }: { kind: FileGlyphKind; name?: string; compact?: boolean }) {
  const glyphKind = name?.endsWith(".url") ? "shortcut" : kind;
  const size = compact ? 14 : 20;
  if (glyphKind === "folder") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 6.5h6.2l2-2H14l2 2h5v12.8H3z" fill="currentColor" opacity=".24" />
        <path d="M3 7h18v12H3zM3 7V5h6l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }
  if (glyphKind === "process") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2" />
        <path d="M12 1.8v3M12 19.2v3M1.8 12h3M19.2 12h3" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  if (glyphKind === "shortcut") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 2.5h8l4 4V21H6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M14 2.5v4h4M10 15l6-6M12 9h4v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 2.5h8l4 4V21H6z" fill="currentColor" opacity=".1" />
      <path d="M6 2.5h8l4 4V21H6zM14 2.5v4h4M9 11h6M9 14h6M9 17h4" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function createSession(id: number, first = false): ShellSession {
  return {
    id,
    cwd: "/srv/app",
    input: "",
    history: [],
    historyIndex: null,
    historyDraft: "",
    awaitingPassword: false,
    guiPath: "/srv/app",
    guiSelected: null,
    lines: first
      ? [
          { id: `${id}-1`, text: "Last login: Mon Jul 28 02:14:09 2026 from 10.0.0.42", tone: "muted" },
          { id: `${id}-2`, text: "Ubuntu 24.04.2 LTS (GNU/Linux 6.8.0 x86_64)", tone: "muted" },
          { id: `${id}-3`, text: "" },
          { id: `${id}-4`, text: "INCIDENT #042  ·  echo-api is returning duplicate responses", tone: "warning" },
          { id: `${id}-5`, text: "Find the unauthorized listener, contain it, then verify recovery.", tone: "default" },
          { id: `${id}-6`, text: "Runbook loaded · commands: `help` · guided assistance: `hint`", tone: "muted" },
        ]
      : [
          { id: `${id}-1`, text: "New SSH session opened on node-07.", tone: "muted" },
          { id: `${id}-2`, text: "Shared incident state synchronized.", tone: "muted" },
        ],
  };
}

function resolvePath(cwd: string, target: string) {
  if (target.startsWith("/")) return target.replace(/\/+$/, "") || "/";
  const resolved: string[] = [];
  for (const part of `${cwd}/${target}`.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") resolved.pop();
    else resolved.push(part);
  }
  return `/${resolved.join("/")}`;
}

export default function TerminalPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ShellSession[]>(() => [createSession(1, true)]);
  const [activeId, setActiveId] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [readBrief, setReadBrief] = useState(false);
  const [foundPid, setFoundPid] = useState(false);
  const [foundKey, setFoundKey] = useState(false);
  const [decodedKey, setDecodedKey] = useState(false);
  const [contained, setContained] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [solvedAtSeconds, setSolvedAtSeconds] = useState<number | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showFinale, setShowFinale] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [hintState, setHintState] = useState<{
    stage: number;
    depth: number;
    mode: Difficulty;
  }>({
    stage: -1,
    depth: 0,
    mode: "hard",
  });
  const [hintText, setHintText] = useState("");
  const [easterEgg, setEasterEgg] = useState<EasterEggVariant | null>(null);
  const [foundEasterEggs, setFoundEasterEggs] = useState<EasterEggId[]>([]);
  const [artifactHint, setArtifactHint] = useState<{
    target: EasterEggId | null;
    depth: number;
  }>({ target: null, depth: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const windowRef = useRef<HTMLElement>(null);
  const lineIdRef = useRef(20);
  const sessionIdRef = useRef(1);
  const fortuneIndexRef = useRef(-1);
  const completionListingRef = useRef("");
  const successToastTimerRef = useRef<number | null>(null);

  const session = sessions.find((item) => item.id === activeId) ?? sessions[0];
  const shortCwd = session.cwd === "/srv/app" ? "~/app" : session.cwd.replace("/srv/app", "~/app");
  const prompt = `guest@node-07:${shortCwd}$`;
  const solved = solvedAtSeconds !== null;
  const flowState = [readBrief, foundPid, foundKey, decodedKey, contained, solved];
  const progress = flowState.filter(Boolean).length;
  const flowStage = flowState.findIndex((done) => !done);
  const activeStage = flowStage === -1 ? MISSION_STEP_COUNT : flowStage;
  const hintContextActive =
    hintState.stage === activeStage && (solved || hintState.mode === difficulty);
  const missionHintExhausted = hintContextActive && hintState.depth >= 2;
  const artifactHintExhausted =
    foundEasterEggs.length === EASTER_EGG_COUNT ||
    (artifactHint.target !== null && artifactHint.depth >= 2);
  const hintExhausted = solved ? artifactHintExhausted : missionHintExhausted;
  const displayedSeconds = solvedAtSeconds ?? elapsedSeconds;
  const elapsed = `${String(Math.floor(displayedSeconds / 60)).padStart(2, "0")}:${String(displayedSeconds % 60).padStart(2, "0")}`;

  const updateSession = (
    updater: Partial<ShellSession> | ((current: ShellSession) => ShellSession),
    targetId = activeId,
  ) => {
    setSessions((current) =>
      current.map((item) => {
        if (item.id !== targetId) return item;
        return typeof updater === "function" ? updater(item) : { ...item, ...updater };
      }),
    );
  };

  const markEasterEggFound = (id: EasterEggId) => {
    if (foundEasterEggs.includes(id)) return;
    const nextFound = [...foundEasterEggs, id];
    setFoundEasterEggs(nextFound);
    if (solved && nextFound.length === EASTER_EGG_COUNT) setShowFinale(true);

    if (artifactHint.target === id) {
      const nextTarget = EASTER_EGG_IDS.find((eggId) => !nextFound.includes(eggId)) ?? null;
      setArtifactHint({ target: nextTarget, depth: nextTarget ? 1 : 0 });
      setHintText(nextTarget ? ARTIFACT_HINTS[nextTarget][0] : "");
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeId, difficulty, session.lines.length, session.awaitingPassword]);

  useEffect(() => {
    if (solvedAtSeconds !== null) return;
    const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [solvedAtSeconds]);

  useEffect(() => () => {
    if (successToastTimerRef.current !== null) {
      window.clearTimeout(successToastTimerRef.current);
    }
  }, []);

  const addLine = (text: string, tone: Tone = "default", linePrompt?: string) => {
    const line: TerminalLine = {
      id: `line-${lineIdRef.current++}`,
      text,
      tone,
      prompt: linePrompt,
    };
    updateSession((current) => ({ ...current, lines: [...current.lines, line] }));
  };

  const addLines = (items: Array<[string, Tone?, boolean?]>) => {
    const nextLines = items.map(([text, tone, preserve]) => ({
      id: `line-${lineIdRef.current++}`,
      text,
      tone: tone ?? "default",
      preserve,
    }));
    updateSession((current) => ({ ...current, lines: [...current.lines, ...nextLines] }));
  };

  const fillCommand = (command: string) => {
    updateSession({ input: command });
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const addSession = () => {
    const id = ++sessionIdRef.current;
    setSessions((current) => [...current, createSession(id)]);
    setActiveId(id);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const closeSession = (id: number) => {
    if (sessions.length === 1) {
      router.push("/");
      return;
    }
    const index = sessions.findIndex((item) => item.id === id);
    const remaining = sessions.filter((item) => item.id !== id);
    setSessions(remaining);
    if (activeId === id) setActiveId(remaining[Math.max(0, index - 1)].id);
  };

  const isPathLocked = (path: string) =>
    !foundKey && (path === "/var/tmp" || path.startsWith("/var/tmp/"));

  const listDirectory = (showHidden: boolean) => {
    if (session.cwd === "/srv/app") {
      if (showHidden) {
        addLines([
          ["total 28", "muted"],
          ["drwxr-xr-x  5 deploy deploy 4096 Jul 28 02:11 ."],
          ["drwxr-xr-x  3 root   root   4096 Jul 21 16:40 .."],
          ["drwx------  2 deploy deploy 4096 Jul 28 02:12 .incident", "accent"],
          ["-rw-------  1 guest  guest   312 Jul 27 23:48 .bash_history", "muted"],
          ["-rw-r--r--  1 deploy deploy  842 Jul 21 16:42 README.md"],
          ["drwxr-xr-x  2 deploy deploy 4096 Jul 28 02:10 logs", "accent"],
          ["drwxr-xr-x  2 guest  guest  4096 Jul 24 18:30 experience", "accent"],
          ["drwxr-xr-x  2 guest  guest  4096 Jul 24 18:30 projects", "accent"],
          ["-rw-r--r--  1 guest  guest   184 Jul 19 10:05 about.txt"],
          ["-rw-r--r--  1 guest  guest    96 Jul 19 10:05 contact.txt"],
          ["-rw-r--r--  1 guest  guest   214 Jul 26 21:19 definitely-not-a-rickroll.url", "warning"],
          ["-rw-r--r--  1 deploy deploy  619 Jul 21 16:42 package.json"],
        ]);
      } else addLine(APP_ITEMS.filter((item) => !item.startsWith(".")).join("    "));
      return;
    }
    if (session.cwd === "/srv/app/.incident") {
      addLine(showHidden ? ".  ..  brief.txt" : "brief.txt");
      return;
    }
    if (session.cwd === "/srv/app/logs") {
      addLine("access.log    error.log    display.channel");
      return;
    }
    if (session.cwd === "/srv/app/experience") {
      addLine("mui-scientific.txt    tencent-music.txt    study-platform.txt    map-uncharted.txt    oncall-notes.txt");
      return;
    }
    if (session.cwd === "/srv/app/projects") {
      addLine("cobalt-guide.md    personal-site.md    websocket-chat.md    resume-analyzer.md    railway-test.txt");
      return;
    }
    if (session.cwd === "/var/tmp") {
      addLine(showHidden ? ".  ..  .echo-key  coffee.order" : "coffee.order");
      return;
    }
    if (session.cwd === "/") {
      addLine(ROOT_ITEMS.join("    "));
      return;
    }
    if (session.cwd === "/srv") return addLine("app/");
    if (session.cwd === "/var") return addLine("tmp/");
    if (session.cwd === "/home") return addLine("guest/");
    if (session.cwd === "/home/guest") return addLine("");
    if (session.cwd === "/proc") {
      return addLine(["1", "412", "642", ...(!contained ? [PID] : []), "8021"].join("    "));
    }
    if (session.cwd.startsWith("/proc/")) return addLine("cmdline    status");
    addLine("");
  };

  const catFile = (target: string) => {
    const path = resolvePath(session.cwd, target);
    if (isPathLocked(path)) {
      addLine(`cat: ${target}: Permission denied`, "error");
      return;
    }
    if (contained && path === `/proc/${PID}/cmdline`) {
      addLine(`cat: ${path}: No such process`, "error");
      return;
    }
    if (path === "/srv/app/.incident/brief.txt") {
      setReadBrief(true);
      addLines([
        ["[02:11:37] Alert: duplicate payload detected on tcp/4040", "warning"],
        ["[02:11:51] Expected service: echo-api (pid 642)"],
        ["[02:12:03] A second listener appeared after deploy."],
        [""],
        ["TASK: establish a process baseline, trace the rogue launch, contain it, then verify recovery.", "accent"],
      ]);
      return;
    }
    if (path === `/proc/${PID}/cmdline`) {
      setFoundKey(true);
      addLine("echo-daemon --listen=0.0.0.0:4040 --key-file=/var/tmp/.echo-key", "accent");
      return;
    }
    if (path === "/var/tmp/.echo-key") {
      addLines([[ENCODED_KEY, "accent"], ["# base64-encoded maintenance credential", "muted"]]);
      return;
    }
    if (path === "/srv/app/README.md") {
      addLine("# echo-api\nProduction echo service\nHealth check: status\nHost inventory: neofetch\nStandard-input probe: cat");
      return;
    }
    if (path === "/srv/app/package.json") {
      addLine('{ "name": "echo-api", "version": "2.7.1", "port": 4040 }');
      return;
    }
    if (path === "/srv/app/logs/error.log") {
      addLines([
        ["02:11:37 WARN response checksum mismatch", "warning"],
        ["02:11:38 WARN duplicate listener detected on :4040", "warning"],
      ]);
      return;
    }
    const portfolioFiles: Record<string, string> = {
      "/srv/app/about.txt": "Sicheng Ouyang | Software Engineering @ UWaterloo | Backend systems + practical ML.",
      "/srv/app/contact.txt": "support@sicheng.dev | github.com/carols12352",
      "/srv/app/.bash_history": "npm run build\ngit status\nsudo rm -rf /",
      "/srv/app/logs/display.channel": "channel=01\nrenderer=matrix\nstate=standby",
      "/srv/app/experience/oncall-notes.txt": "On-call diagnostic database: fortune\nMultiple records available; repeated queries are supported.",
      "/srv/app/experience/mui-scientific.txt": "Software Engineer · Mui Scientific · 2026.04—Present\nInternal inventory tooling, SOPs, and public website.",
      "/srv/app/experience/tencent-music.txt": "Machine Learning Engineer · Tencent Music · 2024.06—2024.08\nEvaluated 10 speech models across 20+ experiments.",
      "/srv/app/experience/study-platform.txt": "Co-Founder · A-Level Study Platform · 2023—2025\nOperated a platform reaching roughly 1,000 DAU.",
      "/srv/app/experience/map-uncharted.txt": "Software Engineer · Map Uncharted · 2023\nReact Native mapping and handwriting recognition experiments.",
      "/srv/app/projects/cobalt-guide.md": "The Cobalt Guide\nCanada-wide, location-aware rewards discovery platform.",
      "/srv/app/projects/personal-site.md": "Personal Site\nNext.js, MDX, motion, and an interactive incident-response terminal.",
      "/srv/app/projects/websocket-chat.md": "Chat WebSocket Demo\nFastAPI, PostgreSQL, Next.js, and realtime delivery.",
      "/srv/app/projects/resume-analyzer.md": "Resume Analyzer\nStructured resume feedback and scoring workflow.",
      "/srv/app/projects/railway-test.txt": "CLI regression case\ncommand=sl\nexpected=locomotive",
      "/var/tmp/coffee.order": "request=coffee\nbrew=brew coffee",
    };
    if (portfolioFiles[path]) {
      addLine(portfolioFiles[path]);
      return;
    }
    if (path === "/srv/app/definitely-not-a-rickroll.url") {
      addLine("URL=https://example.invalid/absolutely-safe-video", "warning");
      return;
    }
    if (path.startsWith("/proc/") && path.endsWith("/cmdline")) {
      addLine(`cat: ${path}: No such process`, "error");
      return;
    }
    addLine(`cat: ${target}: No such file or directory`, "error");
  };

  const requestHint = () => {
    if (solved) {
      const currentTarget =
        artifactHint.target && !foundEasterEggs.includes(artifactHint.target)
          ? artifactHint.target
          : null;
      const target =
        currentTarget ??
        EASTER_EGG_IDS.find((id) => !foundEasterEggs.includes(id)) ??
        null;
      if (!target) return;
      const depth = currentTarget ? Math.min(artifactHint.depth + 1, 2) : 1;
      setArtifactHint({ target, depth });
      setHintText(ARTIFACT_HINTS[target][depth - 1]);
      return;
    }

    const stage = activeStage;
    const sameHintContext =
      hintState.stage === stage && hintState.mode === difficulty;
    if (sameHintContext && hintState.depth >= 2) return;
    const depth = sameHintContext ? hintState.depth + 1 : 1;
    setHintState({ stage, depth, mode: difficulty });
    const hardHints: Array<[string, string]> = [
      ["Incident record not found in the standard directory listing.", "Run `ls -la`; inspect the hidden incident directory."],
      ["Process baseline required: expected service PID is 642.", "Run `ps aux`; identify the additional listener."],
      ["Process launch arguments are available through procfs.", `Read /proc/${PID}/cmdline.`],
      ["Credential metadata indicates base64 encoding.", "Read /var/tmp/.echo-key; decode it with `base64 -d`."],
      ["Target ownership requires elevated privileges.", `Run sudo kill ${PID}; authenticate with the decoded credential.`],
      ["Containment recorded; service recovery is not yet verified.", "Run `status`; confirm one healthy listener on tcp/4040."],
    ];
    const easyHints: Array<[string, string]> = [
      ["Incident record available under the hidden App Files entry.", "Open .incident; select brief.txt."],
      ["Process baseline required: compare owner, CPU, and listening port.", "Open PID 7319/status; flag the process as suspicious."],
      ["Launch inspection pending for the flagged process.", "Open cmdline under PID 7319."],
      ["Credential file located; decoding requires the shell.", "Open .echo-key; insert the decode command."],
      ["Containment requires elevated privileges and the decoded credential.", `Run sudo kill ${PID}; insert the credential when prompted.`],
      ["Containment recorded; service recovery is not yet verified.", "Run `status` or select the incident status control."],
    ];
    const message = (difficulty === "easy" ? easyHints : hardHints)[stage][depth - 1];
    setHintText(message);
    if (difficulty === "hard") {
      addLine(`hint ${depth}/2 · ${message}`, "accent");
    }
  };

  const execute = (rawCommand: string) => {
    const command = rawCommand.trim().replace(/\s+/g, " ");
    if (!command) return;
    addLine(command, "default", prompt);
    updateSession((current) => ({
      ...current,
      history: [...current.history, command],
      historyIndex: null,
      historyDraft: "",
    }));

    if (command === "clear") {
      updateSession({ lines: [] });
      return;
    }
    if (command === "help" || command === "man incident") {
      addLines([
        ["INVESTIGATE  ls -la · cat <file> · ps aux", "accent"],
        ["NAVIGATE     cd <dir> · pwd"],
        ["OPERATE      sudo kill <pid>"],
        ["VERIFY       status"],
        ["SHELL        history · clear · whoami · uname -a · hint"],
        ["SHORTCUTS    ↑/↓ history · tab complete · ctrl+l clear", "muted"],
      ]);
      return;
    }
    if (command === "pwd") return addLine(session.cwd);
    if (command === "whoami") return addLine("guest");
    if (command === "uname -a") return addLine("Linux node-07 6.8.0-63-generic #66-Ubuntu SMP x86_64 GNU/Linux");
    if (command === "date") return addLine("Mon Jul 28 02:24:18 EDT 2026");
    if (["ls", "ls -l", "ls -la", "ls -al"].includes(command)) {
      listDirectory(command.includes("a"));
      return;
    }
    if (command === "history") {
      [...session.history, command].forEach((item, index) =>
        addLine(`${String(index + 1).padStart(4, " ")}  ${item}`, "muted"),
      );
      return;
    }
    if (command === "status") {
      if (solved) {
        addLines([
          ["● echo-api.service  active (running)", "success"],
          ["tcp/4040  1 listener · responses nominal", "success"],
        ]);
      } else if (contained) {
        addLines([
          ["Running recovery checks...", "muted"],
          ["● echo-api.service  active (running)", "success"],
          ["tcp/4040  1 listener · duplicate response rate 0%", "success"],
          ["Incident resolved. Service baseline restored.", "success"],
        ]);
        setSolvedAtSeconds(elapsedSeconds);
        setShowSuccessToast(true);
        if (foundEasterEggs.length === EASTER_EGG_COUNT) setShowFinale(true);
        if (successToastTimerRef.current !== null) {
          window.clearTimeout(successToastTimerRef.current);
        }
        successToastTimerRef.current = window.setTimeout(() => {
          setShowSuccessToast(false);
          successToastTimerRef.current = null;
        }, 6000);
      } else {
        addLines([
          ["● echo-api.service  active (degraded)", "warning"],
          ["tcp/4040  2 listeners · duplicate response rate 48%", "warning"],
        ]);
      }
      return;
    }
    if (command === "ps aux" || command === "ps aux | grep echo") {
      addLines([
        ["USER       PID  %CPU %MEM   START  COMMAND", "muted"],
        ["deploy     642   0.2  1.1   02:10  node /srv/app/server.js"],
        ...(!contained
          ? [[`nobody    ${PID}   8.7  0.4   02:11  /usr/local/bin/echo-daemon`, "warning"] as [string, Tone]]
          : []),
      ]);
      if (!contained) setFoundPid(true);
      return;
    }
    if (command.startsWith("cat ")) {
      catFile(command.slice(4));
      return;
    }
    if (command === "cat") {
      markEasterEggFound("cat");
      addLines([
        [" /\\_/\\\\", "accent"],
        ["( o.o )", "accent"],
        [" > ^ <", "accent"],
        ["cat: standard input closed; no data received", "muted"],
      ]);
      return;
    }
    if (command === "base64 -d /var/tmp/.echo-key" && isPathLocked("/var/tmp/.echo-key")) {
      addLine("base64: /var/tmp/.echo-key: Permission denied", "error");
      return;
    }
    if (command === `echo ${ENCODED_KEY} | base64 -d` || command === "base64 -d /var/tmp/.echo-key") {
      setDecodedKey(true);
      addLine(PASSWORD, "success");
      return;
    }
    if (command.startsWith("cd")) {
      const target = command === "cd" ? "/srv/app" : command.slice(3);
      const next = resolvePath(session.cwd, target);
      if (isPathLocked(next)) {
        addLine(`bash: cd: ${target}: Permission denied`, "error");
        return;
      }
      if (GUI_DIRECTORY_PATHS.includes(next)) {
        updateSession({ cwd: next, guiPath: next, guiSelected: null });
      }
      else addLine(`bash: cd: ${target}: No such file or directory`, "error");
      return;
    }
    if (command === `kill ${PID}`) {
      addLines([[`bash: kill: (${PID}) - Operation not permitted`, "error"], ["Elevated privileges required.", "muted"]]);
      return;
    }
    if (command === `sudo kill ${PID}`) {
      if (contained) {
        addLine(`kill: (${PID}) - No such process`, "muted");
        return;
      }
      const missingEvidence = [
        !readBrief ? "incident brief" : null,
        !foundPid ? "process baseline" : null,
        !foundKey ? "launch arguments" : null,
        !decodedKey ? "decoded credential" : null,
      ].filter(Boolean);
      if (missingEvidence.length) {
        addLines([
          ["sudo: containment blocked by incomplete incident record", "warning"],
          [`Missing: ${missingEvidence.join(" · ")}`, "muted"],
        ]);
        return;
      }
      updateSession({ awaitingPassword: true });
      return;
    }
    if (command === "hint") {
      requestHint();
      return;
    }
    if (command === "neofetch") {
      markEasterEggFound("neofetch");
      addLines([
        ["       /\\        guest@node-07", "accent"],
        ["      /  \\       OS: SichengOS 2.7", "accent"],
        ["     / /\\ \\      Shell: puzzle-sh", "accent"],
        ["    / ____ \\     Uptime: 41 days, 08:17", "accent"],
        ["   /_/    \\_\\    Packages: 404", "accent"],
      ]);
      return;
    }
    if (command === "fortune") {
      markEasterEggFound("fortune");
      const previousIndex = fortuneIndexRef.current;
      const randomValue = new Uint32Array(1);
      window.crypto.getRandomValues(randomValue);
      const nextIndex = previousIndex < 0
        ? randomValue[0] % FORTUNES.length
        : (previousIndex + 1 + (randomValue[0] % (FORTUNES.length - 1))) % FORTUNES.length;
      fortuneIndexRef.current = nextIndex;
      addLine(FORTUNES[nextIndex], "accent");
      return;
    }
    if (command === "sl") {
      markEasterEggFound("sl");
      addLines([
        ["    _____                 . . . . . o o o o o", "accent", true],
        ["  __|[_]|__ ___________ _______    ____      o", "accent", true],
        [" |[] [] []| [] [] [] [] [_____(__  ][]]_n_n__][.", "accent", true],
        ["_|________|_[_________]_[________]_|__|________)<", "accent", true],
        ["  oo    oo 'oo      oo ' oo    oo 'oo 0000---oo\\_", "accent", true],
        [" ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", "accent", true],
      ]);
      return;
    }
    if (command === "matrix") {
      markEasterEggFound("matrix");
      setEasterEgg("matrix");
      return;
    }
    if (command === "open definitely-not-a-rickroll.url" || command === "rickroll") {
      markEasterEggFound("rickroll");
      setEasterEgg("rickroll");
      return;
    }
    if (command === "open resume.pdf") {
      router.push("/resume");
      return;
    }
    if (command === "rm -rf /") {
      addLine("rm: refusing to remove '/': protected filesystem target", "warning");
      return;
    }
    if (command === "sudo rm -rf /") {
      markEasterEggFound("kernel");
      setEasterEgg("kernel");
      return;
    }
    if (command === "coffee") {
      markEasterEggFound("coffee");
      addLine("Have a cup of coffee. ☕", "accent");
      return;
    }
    if (command === "brew coffee") {
      markEasterEggFound("coffee");
      addLines([
        ["       ____________", "muted", true],
        ["      |   COFFEE   |", "muted", true],
        ["      |  [BREWING] |", "accent", true],
        ["      |     ||     |", "muted", true],
        ["      |     ||     |", "muted", true],
        ["      |    c[_]    |", "accent", true],
        ["      |____________|", "muted", true],
        [""],
        ["Have a cup of coffee. ☕", "accent"],
      ]);
      return;
    }
    if (command === "open home" || command === "exit") {
      router.push("/");
      return;
    }
    if (command.startsWith("sudo kill ")) {
      addLine(`kill: (${command.slice(10)}) - No such process`, "error");
      return;
    }
    addLine(`bash: ${command.split(" ")[0]}: command not found`, "error");
  };

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = session.input.trim();
    if (!value) return;
    updateSession({ input: "" });

    if (session.awaitingPassword) {
      if (value === PASSWORD) {
        const nextGuiPath = session.guiPath.startsWith(`/proc/${PID}`) ? "/proc" : session.guiPath;
        addLines([
          [`[1]+  Terminated  /usr/local/bin/echo-daemon (pid ${PID})`, "success"],
          ["tcp/4040 released · duplicate response rate 0%", "success"],
          ["Containment complete. Run `status` to verify service recovery.", "accent"],
        ]);
        setContained(true);
        updateSession({
          awaitingPassword: false,
          cwd: nextGuiPath,
          guiPath: nextGuiPath,
          guiSelected: null,
        });
      } else {
        addLine("sudo: authentication failed", "error");
        updateSession({ awaitingPassword: false });
      }
      return;
    }
    execute(value);
  };

  const completions = useMemo(() => [
    ...COMMANDS, "cd .incident", "cd logs", "cat .incident/brief.txt",
    `cat /proc/${PID}/cmdline`, "cat /var/tmp/.echo-key",
    `echo ${ENCODED_KEY} | base64 -d`, `kill ${PID}`, `sudo kill ${PID}`,
    "hint", "date", "exit", "coffee", "brew coffee", "sl", "rickroll",
    "open definitely-not-a-rickroll.url", "open resume.pdf", "sudo rm -rf /",
  ], []);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Tab") completionListingRef.current = "";
    if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      updateSession({ lines: [] });
      return;
    }
    if (session.awaitingPassword) return;
    if (event.key === "Tab") {
      event.preventDefault();
      if (!session.input.trim()) return;
      const matches = completions.filter((item) => item.startsWith(session.input));
      if (matches.length === 1) {
        completionListingRef.current = "";
        updateSession({ input: matches[0] });
      } else if (matches.length > 1) {
        const listingKey = `${session.input}\u0000${matches.join("\u0000")}`;
        if (completionListingRef.current !== listingKey) {
          completionListingRef.current = listingKey;
          addLine(matches.join("    "), "muted");
        }
      }
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!session.history.length) return;
      if (session.historyIndex === null) {
        const index = session.history.length - 1;
        updateSession({ historyDraft: session.input, historyIndex: index, input: session.history[index] });
      } else {
        const index = Math.max(0, session.historyIndex - 1);
        updateSession({ historyIndex: index, input: session.history[index] });
      }
      return;
    }
    if (event.key === "ArrowDown" && session.historyIndex !== null) {
      event.preventDefault();
      if (session.historyIndex >= session.history.length - 1) {
        updateSession({ historyIndex: null, input: session.historyDraft });
      } else {
        const index = session.historyIndex + 1;
        updateSession({ historyIndex: index, input: session.history[index] });
      }
    }
  };

  const activateToken = (token: string) => {
    const value = token.replaceAll("`", "");
    if (value === ".incident" || value === ".incident/") return execute("cd /srv/app/.incident");
    if (value === "logs" || value === "logs/") return execute("cd /srv/app/logs");
    if (value === "README.md") return execute("cat /srv/app/README.md");
    if (value === "package.json") return execute("cat /srv/app/package.json");
    if (value === "brief.txt") return execute("cat /srv/app/.incident/brief.txt");
    if (value === "error.log") return execute("cat /srv/app/logs/error.log");
    if (value === PID) return fillCommand(decodedKey ? `sudo kill ${PID}` : `cat /proc/${PID}/cmdline`);
    if (value === ENCODED_KEY) return fillCommand(`echo ${ENCODED_KEY} | base64 -d`);
    if (value === PASSWORD) return fillCommand(PASSWORD);
    if (value === "/var/tmp/.echo-key") return execute("cat /var/tmp/.echo-key");
    if (value === `/proc/${PID}/cmdline`) return execute(`cat /proc/${PID}/cmdline`);
    fillCommand(value);
  };

  const guiEntries: GuiEntry[] =
    session.guiPath === "/"
      ? [
          { name: "srv", kind: "folder", size: "—", modified: "root" },
          { name: "proc", kind: "folder", size: "—", modified: "kernel", locked: !readBrief },
          { name: "var", kind: "folder", size: "—", modified: "root" },
          { name: "home", kind: "folder", size: "—", modified: "root" },
        ]
      : session.guiPath === "/srv"
        ? [{ name: "app", kind: "folder", size: "—", modified: "deploy" }]
        : session.guiPath === "/var"
          ? [{ name: "tmp", kind: "folder", size: "—", modified: "root", locked: !foundKey }]
          : session.guiPath === "/home"
            ? [{ name: "guest", kind: "folder", size: "—", modified: "guest" }]
            : session.guiPath === "/home/guest"
              ? []
    : session.guiPath === "/srv/app"
      ? [
          { name: ".incident", kind: "folder", size: "—", modified: "02:12", status: "warning" },
          { name: "experience", kind: "folder", size: "—", modified: "Jul 24" },
          { name: "projects", kind: "folder", size: "—", modified: "Jul 24" },
          { name: "logs", kind: "folder", size: "—", modified: "02:10" },
          { name: ".bash_history", kind: "file", size: "312 B", modified: "23:48" },
          { name: "about.txt", kind: "file", size: "184 B", modified: "Jul 19" },
          { name: "contact.txt", kind: "file", size: "96 B", modified: "Jul 19" },
          { name: "resume.pdf", kind: "file", size: "148 KB", modified: "Jul 19" },
          { name: "definitely-not-a-rickroll.url", kind: "file", size: "214 B", modified: "Jul 26" },
          { name: "README.md", kind: "file", size: "842 B", modified: "Jul 21" },
          { name: "package.json", kind: "file", size: "619 B", modified: "Jul 21" },
        ]
      : session.guiPath === "/srv/app/.incident"
        ? [{ name: "brief.txt", kind: "file", size: "486 B", modified: "02:12", status: "warning" }]
        : session.guiPath === "/srv/app/logs"
          ? [
              { name: "access.log", kind: "file", size: "12 KB", modified: "02:14" },
              { name: "error.log", kind: "file", size: "2 KB", modified: "02:12", status: "warning" },
              { name: "display.channel", kind: "file", size: "48 B", modified: "02:15" },
            ]
          : session.guiPath === "/srv/app/experience"
            ? [
                { name: "mui-scientific.txt", kind: "file", size: "418 B", modified: "2026" },
                { name: "tencent-music.txt", kind: "file", size: "376 B", modified: "2024" },
                { name: "study-platform.txt", kind: "file", size: "352 B", modified: "2025" },
                { name: "map-uncharted.txt", kind: "file", size: "344 B", modified: "2023" },
                { name: "oncall-notes.txt", kind: "file", size: "116 B", modified: "Jul 28" },
              ]
            : session.guiPath === "/srv/app/projects"
              ? [
                  { name: "cobalt-guide.md", kind: "file", size: "1.2 KB", modified: "2026" },
                  { name: "personal-site.md", kind: "file", size: "984 B", modified: "2026" },
                  { name: "websocket-chat.md", kind: "file", size: "812 B", modified: "2025" },
                  { name: "resume-analyzer.md", kind: "file", size: "704 B", modified: "2025" },
                  { name: "railway-test.txt", kind: "file", size: "72 B", modified: "Jul 28" },
                ]
          : session.guiPath === "/proc"
            ? [
                { name: "1", kind: "process", size: "0.0% cpu", modified: "root" },
                { name: "412", kind: "process", size: "0.1% cpu", modified: "root" },
                { name: "642", kind: "process", size: "1.1% mem", modified: "deploy" },
                ...(!contained
                  ? [{ name: PID, kind: "process" as const, size: "8.7% cpu", modified: "nobody" }]
                  : []),
                { name: "8021", kind: "process", size: "0.0% cpu", modified: "guest" },
              ]
            : session.guiPath.startsWith("/proc/")
              ? [
                  { name: "cmdline", kind: "file", size: "86 B", modified: "02:11" },
                  { name: "status", kind: "file", size: "1 KB", modified: "now" },
                ]
              : session.guiPath === "/var/tmp"
                ? [
                    { name: ".echo-key", kind: "file", size: "20 B", modified: "02:11", status: "warning" },
                    { name: "coffee.order", kind: "file", size: "34 B", modified: "02:15" },
                  ]
                : session.guiPath === "/quarantine"
                  ? contained
                    ? [{ name: "7319.echo-daemon", kind: "file", size: "stopped", modified: "now", status: "success" }]
                    : []
                  : [];

  const navigateGui = (path: string) => {
    if (isPathLocked(path)) return;
    updateSession({ cwd: path, guiPath: path, guiSelected: null });
  };

  const openGuiEntry = (entry: GuiEntry) => {
    if (entry.locked) return;
    if (entry.kind === "folder" || entry.kind === "process") {
      const nextPath = `${session.guiPath}/${entry.name}`.replaceAll("//", "/");
      navigateGui(nextPath);
      return;
    }
    updateSession({ guiSelected: entry.name });
    if (session.guiPath === "/srv/app" && entry.name === "definitely-not-a-rickroll.url") {
      markEasterEggFound("rickroll");
      setEasterEgg("rickroll");
    }
    if (session.guiPath === "/srv/app/.incident" && entry.name === "brief.txt") setReadBrief(true);
    if (session.guiPath === `/proc/${PID}` && entry.name === "cmdline" && foundPid) setFoundKey(true);
  };

  const guiFileContent = () => {
    const selected = session.guiSelected;
    if (session.guiPath === "/srv/app/.incident" && selected === "brief.txt") {
      return "Alert: duplicate payload detected on tcp/4040\nExpected: echo-api · pid 642\nA second listener appeared after deploy.";
    }
    if (session.guiPath === `/proc/${PID}` && selected === "cmdline") {
      return "echo-daemon\n--listen=0.0.0.0:4040\n--key-file=/var/tmp/.echo-key";
    }
    if (session.guiPath === `/proc/${PID}` && selected === "status") {
      return contained
        ? "Name: echo-daemon\nState: stopped\nUid: nobody\nCPU: 0.0%\nListen: —"
        : "Name: echo-daemon\nState: running\nUid: nobody\nCPU: 8.7%\nListen: tcp/4040";
    }
    if (session.guiPath.startsWith("/proc/") && selected === "status") {
      const processId = session.guiPath.split("/").at(-1);
      const processData: Record<string, string> = {
        "1": "Name: systemd\nUid: root\nCPU: 0.0%\nListen: —",
        "412": "Name: sshd\nUid: root\nCPU: 0.1%\nListen: tcp/22",
        "642": "Name: echo-api\nUid: deploy\nCPU: 0.2%\nListen: tcp/4040",
        "8021": "Name: puzzle-sh\nUid: guest\nCPU: 0.0%\nListen: —",
      };
      return processData[processId ?? ""] ?? "Process metadata unavailable";
    }
    if (session.guiPath.startsWith("/proc/") && selected === "cmdline") {
      const processId = session.guiPath.split("/").at(-1);
      const commandData: Record<string, string> = {
        "1": "/sbin/init",
        "412": "/usr/sbin/sshd -D",
        "642": "node /srv/app/server.js",
        "8021": "puzzle-sh --session=guest",
      };
      return commandData[processId ?? ""] ?? "";
    }
    if (session.guiPath === "/var/tmp" && selected === ".echo-key") {
      return decodedKey ? PASSWORD : ENCODED_KEY;
    }
    if (session.guiPath === "/srv/app" && selected === "README.md") {
      return "echo-api\nProduction echo service\nPort: 4040\nHost inventory: neofetch\nStandard-input probe: cat";
    }
    if (session.guiPath === "/srv/app" && selected === "package.json") {
      return '{\n  "name": "echo-api",\n  "version": "2.7.1"\n}';
    }
    const guiPortfolioFiles: Record<string, string> = {
      "/srv/app/.bash_history": "npm run build\ngit status\nsudo rm -rf /",
      "/srv/app/about.txt": "Sicheng Ouyang\nSoftware Engineering @ UWaterloo\nBackend systems + practical ML",
      "/srv/app/contact.txt": "support@sicheng.dev\ngithub.com/carols12352",
      "/srv/app/resume.pdf": "PDF preview unavailable in remote shell.\nUse `open resume.pdf` in the terminal.",
      "/srv/app/definitely-not-a-rickroll.url": "Type: Internet shortcut\nClassification: unverified media redirect",
      "/srv/app/experience/mui-scientific.txt": "Software Engineer · Mui Scientific\n2026.04—Present\nInventory tooling, SOPs, and website work.",
      "/srv/app/experience/tencent-music.txt": "Machine Learning Engineer · Tencent Music\nEvaluated 10 speech models across 20+ experiments.",
      "/srv/app/experience/study-platform.txt": "Co-Founder · A-Level Study Platform\nOperated a learning platform reaching ~1,000 DAU.",
      "/srv/app/experience/map-uncharted.txt": "Software Engineer · Map Uncharted\nReact Native maps and recognition experiments.",
      "/srv/app/experience/oncall-notes.txt": "On-call diagnostic database: fortune\nMultiple records available; repeated queries are supported.",
      "/srv/app/projects/cobalt-guide.md": "The Cobalt Guide\nLocation-aware rewards discovery across Canada.",
      "/srv/app/projects/personal-site.md": "Personal Site\nNext.js, MDX, motion, and an incident-response terminal.",
      "/srv/app/projects/websocket-chat.md": "Realtime Chat\nFastAPI + WebSocket + PostgreSQL + Next.js.",
      "/srv/app/projects/resume-analyzer.md": "Resume Analyzer\nStructured resume feedback and scoring.",
      "/srv/app/projects/railway-test.txt": "CLI regression case\ncommand=sl\nexpected=locomotive",
      "/srv/app/logs/display.channel": "channel=01\nrenderer=matrix\nstate=standby",
      "/var/tmp/coffee.order": "request=coffee\nbrew=brew coffee",
    };
    const portfolioPath = `${session.guiPath}/${selected ?? ""}`;
    if (guiPortfolioFiles[portfolioPath]) return guiPortfolioFiles[portfolioPath];
    if (session.guiPath === "/srv/app/logs" && selected === "error.log") {
      return "WARN duplicate listener detected\nWARN response checksum mismatch";
    }
    return "";
  };

  const renderInteractiveText = (text: string) => {
    if (difficulty === "hard") return text;
    const pattern = /(`[^`]+`|c2lsZW50LXByb2Nlc3M=|silent-process|\/proc\/7319\/cmdline|\/var\/tmp\/\.echo-key|\b7319\b|\.incident\/?|README\.md|package\.json|brief\.txt|error\.log|\blogs\/)/g;
    return text.split(pattern).map((part, index) => {
      const interactive = /^`[^`]+`$|^c2lsZW50LXByb2Nlc3M=$|^silent-process$|^\/proc\/7319\/cmdline$|^\/var\/tmp\/\.echo-key$|^7319$|^\.incident\/?$|^README\.md$|^package\.json$|^brief\.txt$|^error\.log$|^logs\/$/.test(part);
      if (!interactive) return part;
      return (
        <button
          type="button"
          key={`${part}-${index}`}
          className={styles.inlineAction}
          onClick={(event) => {
            event.stopPropagation();
            activateToken(part);
          }}
        >
          {part}
        </button>
      );
    });
  };

  const milestones = [
    ["Read incident brief", readBrief],
    ["Establish process baseline", foundPid],
    ["Trace launch arguments", foundKey],
    ["Decode credential", decodedKey],
    ["Contain rogue process", contained],
    ["Verify service recovery", solved],
  ] as const;

  const renderShell = (compact = false) => (
    <div className={`${styles.output} ${compact ? styles.compactOutput : ""}`} ref={scrollRef} aria-live="polite">
      {session.lines.map((line) => (
        <motion.div
          key={line.id}
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
          className={`${styles.line} ${line.preserve ? styles.asciiLine : ""} ${styles[line.tone ?? "default"]}`}
        >
          {line.prompt ? <span className={styles.promptEcho}>{line.prompt} </span> : null}
          {line.text ? renderInteractiveText(line.text) : "\u00a0"}
        </motion.div>
      ))}
      <form onSubmit={onSubmit} className={styles.commandRow}>
        <label htmlFor="terminal-input" className={session.awaitingPassword ? styles.passwordPrompt : styles.livePrompt}>
          {session.awaitingPassword ? "[sudo] password for guest:" : prompt}
        </label>
        <input
          ref={inputRef}
          id="terminal-input"
          value={session.input}
          type={session.awaitingPassword ? "password" : "text"}
          onChange={(event) => {
            completionListingRef.current = "";
            updateSession({ input: event.target.value });
          }}
          onKeyDown={onKeyDown}
          className={styles.commandInput}
          autoFocus
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </div>
  );

  return (
    <main className={styles.desktop}>
      <motion.section
        ref={windowRef}
        className={`${styles.window} ${maximized ? styles.windowMaximized : ""} ${minimized ? styles.windowMinimized : ""}`}
        initial={{ opacity: 0, y: 10, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onPointerDown={() => inputRef.current?.focus()}
      >
        <header className={styles.titlebar} onDoubleClick={() => {
          setMinimized(false);
          setMaximized((value) => !value);
        }}>
          <div className={styles.windowControls}>
            <button type="button" className={styles.closeDot} aria-label="Close terminal" onClick={(event) => { event.stopPropagation(); router.push("/"); }} />
            <button type="button" className={styles.minDot} aria-label="Minimize window" onClick={(event) => {
              event.stopPropagation();
              setMinimized((value) => !value);
            }} />
            <button type="button" className={styles.maxDot} aria-label="Toggle maximize" onClick={(event) => {
              event.stopPropagation();
              setMinimized(false);
              setMaximized((value) => !value);
            }} />
          </div>
          <div className={styles.title}>guest@node-07 — ssh 10.0.0.7</div>
          <Link href="/" className={styles.exitLink}>exit</Link>
        </header>

        <div className={styles.tabbar}>
          <button type="button" className={styles.newTab} title="New SSH session" aria-label="New SSH session" onClick={(event) => {
            event.stopPropagation();
            addSession();
          }}>+</button>
          <div className={styles.tabList} role="tablist">
            {sessions.map((item) => (
              <div
                key={item.id}
                className={`${styles.tab} ${item.id === activeId ? styles.tabActive : ""}`}
                role="tab"
                aria-selected={item.id === activeId}
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveId(item.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setActiveId(item.id);
                }}
              >
                <span className={styles.statusDot} />
                <span className={styles.tabLabel}>guest@node-07 · {item.cwd.replace("/srv/app", "~/app")}</span>
                <button type="button" className={styles.tabClose} aria-label={`Close session ${item.id}`} onClick={(event) => {
                  event.stopPropagation();
                  closeSession(item.id);
                }}>×</button>
              </div>
            ))}
          </div>
          <div className={styles.difficultySwitch} onPointerDown={(event) => event.stopPropagation()}>
            <button type="button" className={difficulty === "hard" ? styles.modeActive : ""} onClick={() => setDifficulty("hard")}>Hard</button>
            <button type="button" className={difficulty === "easy" ? styles.modeActive : ""} onClick={() => setDifficulty("easy")}>Easy</button>
          </div>
        </div>

        <div className={styles.workspace}>
          <div className={styles.terminalPane}>
            {difficulty === "easy" ? (
              <motion.div
                className={styles.hybridWorkspace}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <div className={`${styles.fileManager} ${styles.hybridFiles}`}>
                <section className={styles.fileBrowser}>
                  <header className={styles.fileToolbar}>
                    <button
                      type="button"
                      aria-label="Go up"
                      disabled={session.guiPath === "/"}
                      onClick={() => navigateGui(session.guiPath.split("/").slice(0, -1).join("/") || "/")}
                    >‹</button>
                    <div className={styles.breadcrumbs}>
                      <button type="button" onClick={() => navigateGui("/")}>/<span /></button>
                      {session.guiPath.split("/").filter(Boolean).map((part, index, parts) => {
                        const path = `/${parts.slice(0, index + 1).join("/")}`;
                        return <button type="button" key={path} onClick={() => navigateGui(path)}>{part}<span>/</span></button>;
                      })}
                    </div>
                    <span className={styles.itemCount}>{guiEntries.length} items</span>
                    <button
                      type="button"
                      className={styles.fileHint}
                      aria-label={solved ? "Artifact hint" : "Context hint"}
                      title={hintText || (solved ? "Artifact hint" : "Context hint")}
                      onClick={requestHint}
                      disabled={hintExhausted}
                    >?</button>
                  </header>

                  <div className={styles.fileColumns} aria-hidden="true">
                    <span>Name</span><span>Size / CPU</span><span>Modified / Owner</span>
                  </div>
                  <div className={styles.fileList}>
                    {guiEntries.length ? guiEntries.map((entry) => (
                      <button
                        type="button"
                        key={entry.name}
                        disabled={entry.locked}
                        className={`${styles.fileRow} ${session.guiSelected === entry.name ? styles.fileSelected : ""}`}
                        onClick={() => openGuiEntry(entry)}
                      >
                        <span className={`${styles.fileIcon} ${styles[entry.kind]} ${entry.status === "warning" ? styles.fileWarning : ""}`}>
                          <FileGlyph kind={entry.kind} name={entry.name} />
                        </span>
                        <strong>{entry.name}</strong>
                        <small>{entry.size}</small>
                        <small>{entry.modified}</small>
                        {entry.locked ? (
                          <i className={styles.rowLock} aria-label="Locked">
                            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <rect x="3.25" y="7" width="9.5" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
                              <path d="M5.25 7V5a2.75 2.75 0 0 1 5.5 0v2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                            </svg>
                          </i>
                        ) : entry.kind !== "file" ? <i>›</i> : null}
                      </button>
                    )) : (
                      <div className={styles.emptyFolder}>
                        <span><FileGlyph kind="folder" /></span><strong>Nothing here</strong>
                        <small>No entries in this directory.</small>
                      </div>
                    )}
                  </div>
                </section>

                <aside className={`${styles.filePreview} ${session.guiSelected ? styles.filePreviewOpen : ""}`}>
                  {session.guiSelected ? (
                    <button
                      type="button"
                      className={styles.previewClose}
                      aria-label="Close preview"
                      onClick={() => updateSession({ guiSelected: null })}
                    >×</button>
                  ) : null}
                  {session.guiSelected ? (
                    <>
                      <div className={styles.previewIcon}><FileGlyph kind="file" name={session.guiSelected} /></div>
                      <h2>{session.guiSelected}</h2>
                      <p>{session.guiPath}</p>
                      <pre>{guiFileContent()}</pre>
                      {session.guiPath === "/var/tmp" && session.guiSelected === ".echo-key" && !decodedKey ? (
                        <button
                          type="button"
                          className={styles.primaryFileAction}
                          onClick={() => fillCommand("base64 -d /var/tmp/.echo-key")}
                        >
                          Insert decode command
                        </button>
                      ) : null}
                      {session.guiPath === `/proc/${PID}` && session.guiSelected === "cmdline" ? (
                        <button type="button" className={styles.secondaryFileAction} onClick={() => {
                          navigateGui("/var/tmp");
                          fillCommand("cat /var/tmp/.echo-key");
                        }}>Open path in files + shell</button>
                      ) : null}
                      {session.guiPath === `/proc/${PID}` && session.guiSelected === "status" && !foundPid ? (
                        <button type="button" className={styles.primaryFileAction} onClick={() => setFoundPid(true)}>
                          Flag PID {PID} as suspicious
                        </button>
                      ) : null}
                      {session.guiPath === "/var/tmp" && session.guiSelected === ".echo-key" && decodedKey ? (
                        <button
                          type="button"
                          className={styles.secondaryFileAction}
                          onClick={() => fillCommand(session.awaitingPassword ? PASSWORD : `sudo kill ${PID}`)}
                        >
                          {session.awaitingPassword ? "Insert credential" : "Insert containment command"}
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <div className={styles.previewEmpty}>
                      <span>⌁</span><strong>Select an item</strong>
                      <small>File contents and available operations appear here.</small>
                    </div>
                  )}
                </aside>
                </div>
                <section className={styles.hybridTerminal}>
                  <header>
                    <span className={styles.statusDot} />
                    SHELL
                    <strong>{shortCwd}</strong>
                  </header>
                  {renderShell(true)}
                </section>
              </motion.div>
            ) : (
              renderShell()
            )}
          </div>

          <aside className={styles.inspector}>
            <button type="button" className={styles.incidentHeader} onClick={() => execute("status")}>
              <span className={styles.eyebrow}>INCIDENT #042</span>
              <span className={styles.incidentTitle}>Duplicate echo</span>
            </button>
            <button
              type="button"
              className={`${styles.severity} ${contained && !solved ? styles.verifying : ""} ${solved ? styles.resolved : ""}`}
              onClick={() => execute("status")}
            >
              <span /> {solved ? "RESOLVED · HEALTHY" : contained ? "CONTAINED · VERIFY" : "SEV-3 · ACTIVE"}
            </button>

            <div className={styles.progressBlock}>
              <div className={styles.progressMeta}>
                <span>Runbook</span><span>{progress}/{MISSION_STEP_COUNT}</span>
              </div>
              <div className={styles.progressTrack}>
                <motion.span animate={{ width: `${(progress / MISSION_STEP_COUNT) * 100}%` }} />
              </div>
              <ol className={styles.milestones}>
                {milestones.map(([label, done], index) => (
                  <li
                    key={label}
                    className={done ? styles.done : index === activeStage ? styles.current : ""}
                    aria-current={index === activeStage ? "step" : undefined}
                  >
                    <span>{done ? "✓" : index === activeStage ? "→" : String(index + 1).padStart(2, "0")}</span>{label}
                  </li>
                ))}
              </ol>
            </div>

            <div className={styles.sessionMeta}>
              <button type="button" onClick={() => execute("uname -a")}><span>HOST</span><strong>node-07</strong></button>
              <button type="button" onClick={() => execute("history")}><span>TABS</span><strong>{sessions.length}</strong></button>
              <button type="button" onClick={() => execute("date")}><span>SESSION</span><strong>{elapsed}</strong></button>
            </div>
            {solved ? (
              <div
                className={styles.easterProgress}
                aria-label={`${foundEasterEggs.length} of ${EASTER_EGG_COUNT} Easter eggs found`}
              >
                <div>
                  <span>Easter eggs found</span>
                  <strong>{foundEasterEggs.length}/{EASTER_EGG_COUNT}</strong>
                </div>
                <div className={styles.easterProgressTrack} aria-hidden="true">
                  <motion.span
                    animate={{ width: `${(foundEasterEggs.length / EASTER_EGG_COUNT) * 100}%` }}
                  />
                </div>
              </div>
            ) : null}
            <button
              type="button"
              className={styles.hintButton}
              disabled={hintExhausted}
              onClick={(event) => { event.stopPropagation(); requestHint(); }}
            >
              {solved
                ? foundEasterEggs.length === EASTER_EGG_COUNT
                  ? "All artifacts found"
                  : "Artifact hint"
                : "Context hint"} <span>
                {solved
                  ? artifactHint.depth > 0
                    ? `${artifactHint.depth}/2`
                    : "↵"
                  : hintContextActive && hintState.depth > 0
                    ? `${hintState.depth}/2`
                    : "↵"}
              </span>
            </button>
            <AnimatePresence>
              {hintText && (solved ? artifactHint.target !== null : hintContextActive) ? (
                <motion.p
                  key={solved ? artifactHint.target : `${activeStage}-${hintState.depth}`}
                  className={styles.hintText}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {hintText}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </aside>
        </div>

        <footer className={styles.statusbar}>
          <span className={styles.connectionStatus}><i className={styles.connectedDot} /> SSH · node-07 · connected</span>
          <button type="button" className={styles.shortcutHelp} onClick={() => execute("help")}>
            {difficulty === "hard" ? "CLI ONLY · tab complete · ctrl+l clear" : "ASSISTED · FILES + SHELL"}
          </button>
          <span className={styles.mobileProgress}>
            {solved
              ? `EGGS ${foundEasterEggs.length}/${EASTER_EGG_COUNT}`
              : `RUNBOOK ${progress}/${MISSION_STEP_COUNT}`}
          </span>
          <button type="button" onClick={() => addLine("LANG=en_CA.UTF-8", "muted")}>UTF-8</button>
        </footer>
      </motion.section>

      <TerminalEasterEgg variant={easterEgg} onClose={() => setEasterEgg(null)} />

      <AnimatePresence>
        {showFinale ? (
          <motion.div
            className={styles.finale}
            role="dialog"
            aria-modal="true"
            aria-labelledby="finale-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFinale(false)}
          >
            <div className={styles.confetti} aria-hidden="true">
              {CONFETTI_PIECES.map((piece) => (
                <i
                  key={piece.id}
                  style={{
                    left: piece.left,
                    animationDelay: piece.delay,
                    animationDuration: piece.duration,
                    backgroundColor: piece.color,
                  }}
                />
              ))}
            </div>
            <motion.div
              className={styles.finaleMessage}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <span>8/8 EASTER EGGS FOUND</span>
              <h2 id="finale-title">HURRAY!</h2>
              <p>Thanks for playing.<br />Hope you liked my little terminal game.</p>
              <button type="button" onClick={() => setShowFinale(false)}>Back to terminal</button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {solved && showSuccessToast ? (
          <motion.div
            className={styles.successToast}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 360, damping: 28 }}
          >
            <span className={styles.successIcon}>✓</span>
            <div><strong>Incident resolved</strong><p>echo-api is healthy · recovery verified in {elapsed}</p></div>
            <button type="button" onClick={() => router.push("/")}>Return home</button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
