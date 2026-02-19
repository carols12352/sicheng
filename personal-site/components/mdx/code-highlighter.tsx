import type { ReactNode } from "react";

type CodeHighlighterProps = {
  code: string;
  language: string;
};

const KEYWORDS: Record<string, string[]> = {
  js: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "switch", "case", "break", "continue", "new", "this", "class", "try", "catch", "throw", "await", "async", "import", "from", "export", "default"],
  ts: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "switch", "case", "break", "continue", "new", "this", "class", "try", "catch", "throw", "await", "async", "import", "from", "export", "default", "type", "interface", "extends", "implements", "readonly", "public", "private", "protected"],
  jsx: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "className"],
  tsx: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "type", "interface", "className"],
  py: ["def", "class", "return", "if", "elif", "else", "for", "while", "import", "from", "as", "try", "except", "finally", "with", "lambda", "yield", "pass", "break", "continue", "True", "False", "None"],
  python: ["def", "class", "return", "if", "elif", "else", "for", "while", "import", "from", "as", "try", "except", "finally", "with", "lambda", "yield", "pass", "break", "continue", "True", "False", "None"],
  bash: ["if", "then", "fi", "for", "do", "done", "case", "esac", "function", "echo", "export"],
  sh: ["if", "then", "fi", "for", "do", "done", "case", "esac", "function", "echo", "export"],
  json: ["true", "false", "null"],
};

function normalizeLanguage(language: string): string {
  const lower = language.toLowerCase();
  if (lower === "javascript") return "js";
  if (lower === "typescript") return "ts";
  if (lower === "shell" || lower === "zsh") return "sh";
  return lower;
}

function getRegex(language: string): RegExp {
  const normalized = normalizeLanguage(language);
  const keywords = KEYWORDS[normalized] ?? [];
  const keywordPattern = keywords.length > 0 ? `\\b(?:${keywords.join("|")})\\b` : "$^";
  const commentPattern = normalized === "py" || normalized === "python" || normalized === "sh" || normalized === "bash"
    ? "#[^\\n]*"
    : "\\/\\/[^\\n]*";
  const stringPattern = "`(?:\\\\.|[^`\\\\])*`|\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'";
  const numberPattern = "\\b\\d+(?:\\.\\d+)?\\b";
  const jsonKeyPattern = normalized === "json" ? "\"(?:\\\\.|[^\"\\\\])*\"(?=\\s*:)" : "$^";

  return new RegExp(`(${commentPattern})|(${stringPattern})|(${jsonKeyPattern})|(${numberPattern})|(${keywordPattern})`, "gm");
}

function classifyToken(token: string, language: string): string {
  const normalized = normalizeLanguage(language);
  if (normalized === "json" && /^"(?:\\.|[^"\\])*"(?=\s*:)/.test(token)) return "token-key";
  if (/^(\/\/|#)/.test(token)) return "token-comment";
  if (/^`|^"|^'/.test(token)) return "token-string";
  if (/^\d/.test(token)) return "token-number";
  return "token-keyword";
}

export function CodeHighlighter({ code, language }: CodeHighlighterProps) {
  const regex = getRegex(language);
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(code)) !== null) {
    const token = match[0];
    const start = match.index;
    if (start > lastIndex) {
      nodes.push(<span key={`t-${key++}`}>{code.slice(lastIndex, start)}</span>);
    }
    nodes.push(
      <span key={`h-${key++}`} className={classifyToken(token, language)}>
        {token}
      </span>,
    );
    lastIndex = start + token.length;
  }

  if (lastIndex < code.length) {
    nodes.push(<span key={`t-${key++}`}>{code.slice(lastIndex)}</span>);
  }

  return <>{nodes}</>;
}
