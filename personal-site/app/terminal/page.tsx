"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

type TerminalLine = {
  id: number;
  text: string;
  tone?: "normal" | "warn" | "error";
};

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
  "sudo rm -rf /",
];

const FILES: Record<string, string> = {
  "about.txt": "Sicheng Ouyang | Software Engineering @ UWaterloo | Backend systems + practical ML.",
  "contact.txt": "email: sicheng.ouyang@uwaterloo.ca | github: github.com/carols12352",
  "notes.md": "Build small, ship fast, keep interfaces clear.",
  "projects/readme.txt": "Use `ls` then `open <project-name>` to jump to project details.",
};

export default function TerminalPage() {
  const router = useRouter();
  const [cwd, setCwd] = useState("/");
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 1, text: "SichengOS 1.0.0 - terminal mode" },
    { id: 2, text: "Type `help` to list commands." },
  ]);
  const [crashing, setCrashing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(3);

  const prompt = useMemo(() => `guest@sicheng.dev:${cwd}$`, [cwd]);

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

    if (command === "sudo rm -rf /") {
      pushLine("[sudo] password for guest: ********", "warn");
      pushLine("Deleting / ...", "error");
      setCrashing(true);
      window.setTimeout(() => {
        setCrashing(false);
        setCwd("/");
        setLines([
          { id: 1, text: "Kernel panic (not really). System restored." },
          { id: 2, text: "Nice try. Type `help`." },
        ]);
        nextIdRef.current = 3;
      }, 2200);
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
                className="w-full bg-transparent text-green-200 outline-none"
                autoFocus
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {crashing ? (
          <motion.div
            className="pointer-events-none fixed inset-0 z-50 bg-red-700/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.2, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2 }}
          >
            <div className="flex h-full items-center justify-center px-4 text-center font-mono text-lg font-semibold text-white sm:text-2xl">
              SYSTEM FAILURE: SEGMENTATION FAULT
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
