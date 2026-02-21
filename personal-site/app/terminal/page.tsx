"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TerminalLine = {
  id: number;
  text: string;
  tone?: "normal" | "warn" | "error";
};
type CrashVariant = "kernel" | "humor" | "minimal";

const ROOT_ITEMS = ["projects/", "resume.pdf", "about.txt", "contact.txt", "notes.md", "ops-key.txt"];
const PROJECT_ITEMS = [
  "chat-websocket-demo",
  "todo-list-web-desktop-app",
  "resume-analyzer",
  "latex-template-resume",
];

const HELP_LINES = [
  "help",
  "ls",
  "tree",
  "pwd",
  "cd projects",
  "cd ..",
  "cat about.txt",
  "cat contact.txt",
  "open home",
  "open <item>",
  "clear",
  "> rm: Remove files (Usage restricted to sudoers. Please don't try on /)",
];

const FILES: Record<string, string> = {
  "about.txt": "Sicheng Ouyang | Software Engineering @ UWaterloo | Backend systems + practical ML.",
  "contact.txt": "email: support@sicheng.dev | github: github.com/carols12352",
  "notes.md": "Build small, ship fast, keep interfaces clear. Ops note: if sudo asks questions, check ops-key.txt.",
  "ops-key.txt": "sudo password: thankyouforplaying",
  "projects/readme.txt": "Use `ls` then `open <project-name>` to jump to project details.",
};
const CRASH_VARIANTS: CrashVariant[] = ["kernel", "humor", "minimal"];
const SUDO_PASSWORD = "thankyouforplaying";
const RECOVERY_LINES: Record<CrashVariant, [string, string]> = {
  kernel: [
    "Rollback complete. Kernel stabilized and init restored.",
    "Diagnostic note: / is still protected. Maybe try `help` instead of chaos.",
  ],
  humor: [
    "Rollback complete. The System Cat has stepped away from the keyboard.",
    "Treat debt forgiven. You may continue in guest mode.",
  ],
  minimal: [
    "Rollback complete. Reality.exe restored from clean snapshot.",
    "Matrix rain stopped. Filesystem integrity: green.",
  ],
};

const BOOT_LINES = [
  "booting SichengOS ...",
  "loading shell modules ...",
  "mounting /projects and /writing ...",
  "starting interactive console ...",
];

export default function TerminalPage() {
  const router = useRouter();
  const [cwd, setCwd] = useState("/");
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 1, text: "SichengOS 1.0.0 - terminal mode" },
    { id: 2, text: "Type `help` to list commands." },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>(["sudo rm -rf /"]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);
  const [historyDraft, setHistoryDraft] = useState("");
  const [awaitingSudoPassword, setAwaitingSudoPassword] = useState(false);
  const [sudoAttempts, setSudoAttempts] = useState(0);
  const [crashVariant, setCrashVariant] = useState<CrashVariant | null>(null);
  const [catSeed, setCatSeed] = useState("init");
  const [rainGlyphs, setRainGlyphs] = useState<Array<{ id: number; left: number; char: string; duration: number; delay: number }>>([]);
  const [booting, setBooting] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(3);

  const prompt = useMemo(
    () => (awaitingSudoPassword ? "[sudo] password for guest:" : `guest@sicheng.dev:${cwd}$`),
    [awaitingSudoPassword, cwd],
  );

  const recoverCrash = useCallback((variant: CrashVariant | null = crashVariant) => {
    setCrashVariant(null);
    setAwaitingSudoPassword(false);
    setSudoAttempts(0);
    setCwd("/");
    const recovery = variant ? RECOVERY_LINES[variant] : [
      "Rollback complete. Filesystem restored.",
      "Type `help` to continue.",
    ];
    setLines([
      { id: 1, text: recovery[0] },
      { id: 2, text: recovery[1] },
    ]);
    nextIdRef.current = 3;
  }, [crashVariant]);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 1800);
    const dismiss = () => setBooting(false);
    window.addEventListener("keydown", dismiss);
    window.addEventListener("pointerdown", dismiss);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("pointerdown", dismiss);
    };
  }, []);

  useEffect(() => {
    if (!crashVariant) {
      return;
    }

    const variant = crashVariant;
    const onKeyDown = () => recoverCrash(variant);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [crashVariant, recoverCrash]);

  const pushLine = (text: string, tone: TerminalLine["tone"] = "normal") => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    setLines((prev) => [...prev, { id, text, tone }]);
    window.setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 0);
  };

  const triggerCrashSequence = () => {
    const variant = CRASH_VARIANTS[Math.floor(Math.random() * CRASH_VARIANTS.length)];
    setCrashVariant(variant);
    setCatSeed(Math.random().toString(36).slice(2, 10));
    if (variant === "minimal") {
      setRainGlyphs(
        Array.from({ length: 36 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          char: "01/$#;[]".charAt(Math.floor(Math.random() * 8)),
          duration: 1.8 + Math.random() * 2.2,
          delay: Math.random() * 0.9,
        })),
      );
    }
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (awaitingSudoPassword || commandHistory.length === 0) {
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (historyCursor === null) {
        setHistoryDraft(input);
        const nextCursor = commandHistory.length - 1;
        setHistoryCursor(nextCursor);
        setInput(commandHistory[nextCursor]);
        return;
      }

      const nextCursor = Math.max(0, historyCursor - 1);
      setHistoryCursor(nextCursor);
      setInput(commandHistory[nextCursor]);
      return;
    }

    if (event.key === "ArrowDown") {
      if (historyCursor === null) {
        return;
      }

      event.preventDefault();
      if (historyCursor >= commandHistory.length - 1) {
        setHistoryCursor(null);
        setInput(historyDraft);
        return;
      }

      const nextCursor = historyCursor + 1;
      setHistoryCursor(nextCursor);
      setInput(commandHistory[nextCursor]);
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const command = input.trim();
    if (!command) {
      return;
    }

    if (awaitingSudoPassword) {
      setInput("");

      if (command === SUDO_PASSWORD) {
        setAwaitingSudoPassword(false);
        setSudoAttempts(0);
        pushLine("Authentication successful.", "warn");
        pushLine("Deleting / ...", "error");
        triggerCrashSequence();
      } else {
        const nextAttempts = sudoAttempts + 1;
        if (nextAttempts >= 3) {
          setAwaitingSudoPassword(false);
          setSudoAttempts(0);
          pushLine("sudo: 3 incorrect password attempts", "error");
          pushLine("Hint by Sicheng: How did I forget again... maybe I should put the password in a txt file.", "warn");
        } else {
          setSudoAttempts(nextAttempts);
          pushLine("Sorry, try again.", "error");
        }
      }
      return;
    }

    pushLine(`${prompt} ${command}`);
    setInput("");
    setHistoryCursor(null);
    setHistoryDraft("");
    setCommandHistory((prev) => [...prev, command]);

    if (command === "help") {
      HELP_LINES.forEach((item) => pushLine(item));
      return;
    }

    if (command === "pwd") {
      pushLine(cwd);
      return;
    }

    if (command === "ls") {
      if (cwd === "/projects") {
        pushLine(PROJECT_ITEMS.join("  "));
      } else {
        pushLine(ROOT_ITEMS.join("  "));
      }
      return;
    }

    if (command === "tree") {
      if (cwd === "/projects") {
        pushLine(".");
        pushLine("|-- chat-websocket-demo");
        pushLine("|-- todo-list-web-desktop-app");
        pushLine("|-- resume-analyzer");
        pushLine("|-- latex-template-resume");
      } else {
        pushLine(".");
        pushLine("|-- projects");
        pushLine("|   |-- chat-websocket-demo");
        pushLine("|   |-- todo-list-web-desktop-app");
        pushLine("|   |-- resume-analyzer");
        pushLine("|   `-- latex-template-resume");
        pushLine("|-- resume.pdf");
        pushLine("|-- about.txt");
        pushLine("|-- contact.txt");
        pushLine("|-- ops-key.txt");
        pushLine("`-- notes.md");
      }
      return;
    }

    if (command === "cd projects") {
      setCwd("/projects");
      return;
    }

    if (command === "cd ..") {
      setCwd("/");
      return;
    }

    if (command === "open resume.pdf") {
      pushLine("Launching /resume ...");
      router.push("/resume");
      return;
    }

    if (command === "cat about.txt" || command === "cat contact.txt" || command === "cat notes.md" || command === "cat ops-key.txt") {
      if (cwd !== "/") {
        pushLine(`cat: ${command.replace("cat ", "")}: No such file in ${cwd}`, "warn");
        return;
      }
      const file = command.replace("cat ", "");
      pushLine(FILES[file]);
      return;
    }

    if (command === "cat readme.txt") {
      if (cwd !== "/projects") {
        pushLine("cat: readme.txt: No such file", "warn");
        return;
      }
      pushLine(FILES["projects/readme.txt"]);
      return;
    }

    if (command.startsWith("open ")) {
      const target = command.replace("open ", "").toLowerCase();
      const routeMap: Record<string, string> = {
        home: "/",
        about: "/about",
        projects: "/projects",
        writing: "/writing",
        resume: "/resume",
        "resume.pdf": "/resume",
        "chat-websocket-demo": "/projects#chat-websocket-demo",
        "todo-list-web-desktop-app": "/projects#todo-list-web-desktop-app",
        "resume-analyzer": "/projects#resume-analyzer",
        "latex-template-resume": "/projects#latex-template-resume",
      };

      const targetRoute = routeMap[target];
      if (!targetRoute) {
        pushLine(`open: cannot find target '${target}'`, "warn");
        return;
      }

      pushLine(`Opening ${target} ...`);
      router.push(targetRoute);
      return;
    }

    if (command === "clear") {
      setLines([]);
      return;
    }

    if (command === "rm") {
      pushLine("What do you want to remove? You have no power here.", "warn");
      return;
    }

    if (command === "rm -rf") {
      pushLine("Target missing. Are you looking for '/'?", "warn");
      return;
    }

    if (command === "rm -rf /") {
      pushLine("rm: cannot remove '/': Permission denied. Try sudo.", "warn");
      return;
    }

    if (command === "sudo rm -rf /") {
      setSudoAttempts(0);
      setAwaitingSudoPassword(true);
      return;
    }

    if (command === "sudo") {
      pushLine("sudo: a command is required. Try `sudo rm -rf /`.", "warn");
      return;
    }

    if (command.startsWith("sudo ")) {
      pushLine("sudo: target not recognized. If you insist, try `sudo rm -rf /`.", "warn");
      return;
    }

    pushLine(`command not found: ${command}`, "warn");
  };

  return (
    <section className="min-h-screen bg-black px-4 py-6 text-green-400 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 flex items-center justify-between font-mono text-xs text-green-500/90">
          <p>TERMINAL MODE</p>
          <Link href="/" className="text-green-300 hover:text-green-200">
            exit
          </Link>
        </div>

        <div className="rounded-xl border border-green-900/80 bg-black/80">
          <div
            ref={scrollRef}
            className="h-[72vh] overflow-auto px-4 py-4 font-mono text-sm leading-6"
           
           
           
           
          >
            {lines.map((line) => (
              <p
                key={line.id}
                className={
                  line.tone === "error"
                    ? "text-red-400"
                    : line.tone === "warn"
                      ? "text-amber-300"
                      : "text-green-300"
                }
              >
                {line.text}
              </p>
            ))}
          </div>
          <form onSubmit={onSubmit} className="border-t border-green-900/80 px-4 py-3">
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-green-300">{prompt}</span>
              <input
                id="terminal-input"
                type="text"
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  if (!awaitingSudoPassword && historyCursor === null) {
                    setHistoryDraft(event.target.value);
                  }
                }}
                onKeyDown={onInputKeyDown}
                className="w-full bg-transparent text-green-200 caret-green-300 outline-none"
                autoFocus
                autoComplete="off"
                spellCheck={false}
               
              />
            </div>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {booting ? (
          <motion.div
            className="fixed inset-0 z-40 bg-black"
           
           
           
           
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="relative mx-auto flex h-full w-full max-w-5xl items-center justify-center px-6">
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-transparent"
                initial={{ y: "-100%" }}
                animate={{ y: "100%" }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
              <div className="w-full max-w-2xl rounded-xl border border-green-900/70 bg-black/85 p-6 font-mono text-sm">
                <p id="terminal-boot-title" className="mb-3 text-green-300">TERMINAL BOOT SEQUENCE</p>
                {BOOT_LINES.map((line, index) => (
                  <motion.p
                    key={line}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.18, duration: 0.25 }}
                    className="text-green-500"
                  >
                    {">"} {line}
                  </motion.p>
                ))}
                <motion.p
                  id="terminal-boot-description"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  className="mt-4 text-xs text-green-400/90"
                >
                  Press any key to continue
                </motion.p>
              </div>
            </div>
          </motion.div>
        ) : null}

        {crashVariant === "kernel" ? (
          <motion.div
            className="fixed inset-0 z-50 bg-black px-4 py-8 font-mono text-sm text-gray-100"
           
           
           
           
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.95, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                recoverCrash("kernel");
              }
            }}
          >
            <div className="mx-auto max-w-4xl space-y-2">
              <p id="terminal-kernel-title">[  0.001234] Kernel panic - not syncing: Attempted to kill init! exitcode=0x00000000</p>
              <p>[  0.002567] rm: cannot remove &apos;/&apos;: Permission denied (Nice try, kid.)</p>
              <p>[  1.042069] System halted. Please refresh to restore reality.</p>
              <p id="terminal-kernel-description" className="mt-6 text-green-300">Press any key to rollback.</p>
            </div>
          </motion.div>
        ) : null}

        {crashVariant === "humor" ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6"
           
           
           
           
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                recoverCrash("humor");
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.94, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl rounded-xl border border-red-500 bg-red-950/70 p-6 font-mono"
              onClick={(event) => event.stopPropagation()}
            >
              <p id="terminal-humor-title" className="text-lg font-semibold text-red-300">[ERROR] UNAUTHORIZED DESTRUCTIVE COMMAND</p>
              <p className="mt-3 text-sm text-red-100">
                sudo: guest is not in the sudoers file. This incident will be reported.
              </p>
              <p className="mt-3 text-sm text-red-100">
                Oops. You tried to delete my hard work. Luckily, this code lives on GitHub.
              </p>
              <p className="mt-3 text-sm text-red-200">
                Your destructive command was intercepted by the System Cat. Please provide treats to continue.
              </p>
              <div className="mt-4 inline-block overflow-hidden rounded-md border border-red-400/70">
                <Image
                  src={`https://cataas.com/cat?width=120&height=120&random=${catSeed}`}
                  alt="System cat guard"
                  width={120}
                  height={120}
                  className="h-16 w-16 object-cover"
                />
              </div>
              <p className="mt-2 text-sm text-red-100">
                Treats link:{" "}
                <a
                  href="https://www.buymeacoffee.com/ouyang12352"
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-red-300/70 underline-offset-2 hover:text-red-50"
                >
                  buymeacoffee.com/ouyang12352
                </a>
              </p>
              <p id="terminal-humor-description" className="mt-6 text-sm text-red-100">Press any key to rollback.</p>
            </motion.div>
          </motion.div>
        ) : null}

        {crashVariant === "minimal" ? (
          <motion.div
            className="fixed inset-0 z-50 overflow-hidden bg-black/88"
           
           
           
           
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                recoverCrash("minimal");
              }
            }}
          >
            {rainGlyphs.map((glyph) => (
              <motion.span
                key={glyph.id}
                className="pointer-events-none absolute top-0 font-mono text-sm text-green-300/55"
                style={{ left: `${glyph.left}%` }}
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: "110vh", opacity: [0, 0.8, 0.35] }}
                transition={{ duration: glyph.duration, delay: glyph.delay, ease: "linear" }}
              >
                {glyph.char}
              </motion.span>
            ))}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center font-mono text-sm text-gray-100 sm:text-base">
              <div className="pointer-events-auto" onClick={(event) => event.stopPropagation()}>
                <p id="terminal-minimal-title">Deleting your boredom... [100%]</p>
                <p className="mt-1">Error: Reality.exe cannot be deleted.</p>
                <p id="terminal-minimal-description" className="mt-4 text-green-300">Press any key to rollback.</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
