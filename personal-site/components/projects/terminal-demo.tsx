type TerminalDemoProps = {
  title: string;
  lines: string[];
};

export function TerminalDemo({ title, lines }: TerminalDemoProps) {
  return (
    <figure className="terminal-demo">
      <figcaption className="terminal-demo-head">{title}</figcaption>
      <pre className="terminal-demo-body" aria-label={title}>
        <code>
          {lines.join("\n")}
        </code>
      </pre>
    </figure>
  );
}
