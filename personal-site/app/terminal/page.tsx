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

const ROOT_ITEMS = ["projects/", "resume.pdf", "about.txt", "contact.txt", "notes.md"];
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
  "contact.txt": "email: sicheng.ouyang@uwaterloo.ca | github: github.com/carols12352",
  "notes.md": "Build small, ship fast, keep interfaces clear.",
  "projects/readme.txt": "Use `ls` then `open <project-name>` to jump to project details.",
};
const CRASH_VARIANTS: CrashVariant[] = ["kernel", "humor", "minimal"];

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
  const [crashVariant, setCrashVariant] = useState<CrashVariant | null>(null);
  const [catSeed, setCatSeed] = useState("init");
  const [rainGlyphs, setRainGlyphs] = useState<Array<{ id: number; left: number; char: string; duration: number; delay: number }>>([]);
  const [booting, setBooting] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(3);

  const prompt = useMemo(() => `guest@sicheng.dev:${cwd}$`, [cwd]);

  const recoverCrash = useCallback(() => {
    setCrashVariant(null);
    setCwd("/");
    setLines([
      { id: 1, text: "Rollback complete. Filesystem restored." },
      { id: 2, text: "System Cat accepted your apology. Type `help`." },
    ]);
    nextIdRef.current = 3;
  }, []);

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

    const onKeyDown = () => recoverCrash();
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
    pushLine("[sudo] password for guest: ********", "warn");
    pushLine("Deleting / ...", "error");
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

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const command = input.trim();
    if (!command) {
      return;
    }

    pushLine(`${prompt} ${command}`);
    setInput("");

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

    if (command === "cat about.txt" || command === "cat contact.txt" || command === "cat notes.md") {
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

    if (command === "rm -rf /" || command === "sudo rm -rf /") {
      triggerCrashSequence();
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
          <div ref={scrollRef} className="h-[72vh] overflow-auto px-4 py-4 font-mono text-sm leading-6">
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
            <label htmlFor="terminal-input" className="sr-only">
              terminal input
            </label>
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-green-300">{prompt}</span>
              <input
                id="terminal-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
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
                <p className="mb-3 text-green-300">TERMINAL BOOT SEQUENCE</p>
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
                recoverCrash();
              }
            }}
          >
            <div className="mx-auto max-w-4xl space-y-2">
              <p>[  0.001234] Kernel panic - not syncing: Attempted to kill init! exitcode=0x00000000</p>
              <p>[  0.002567] rm: cannot remove &apos;/&apos;: Permission denied (Nice try, kid.)</p>
              <p>[  1.042069] System halted. Please refresh to restore reality.</p>
              <p className="mt-6 text-green-300">Press any key to rollback.</p>
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
                recoverCrash();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.94, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl rounded-xl border border-red-500 bg-red-950/70 p-6 font-mono"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="text-lg font-semibold text-red-300">[ERROR] UNAUTHORIZED DESTRUCTIVE COMMAND</p>
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
              <p className="mt-6 text-sm text-red-100">Press any key to rollback.</p>
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
                recoverCrash();
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
                <p>Deleting your boredom... [100%]</p>
                <p className="mt-1">Error: Reality.exe cannot be deleted.</p>
                <p className="mt-4 text-green-300">Press any key to rollback.</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
