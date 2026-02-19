# Writing MDX Components

This folder stores long-form articles (`.mdx`) used by `/writing` and `/writing/[slug]`.

## Available Custom Components

All components below are already registered in `components/mdx/mdx-components.tsx`, so you can use them directly in any article without importing.

### `Sidenote`

Inline footnote with desktop side rendering and mobile sheet fallback.

```mdx
Term<Sidenote label="short-label">Explanation text.</Sidenote>
```

### `MermaidDiagram`

Mermaid chart renderer with click-to-zoom.

```mdx
<MermaidDiagram title="System Flow">
flowchart LR
  Input --> Model --> Output
</MermaidDiagram>
```

### `TokenPredictionDemo`

Interactive React demo showing how token probabilities shift with richer context.

```mdx
<TokenPredictionDemo />
```

### `Callout`

Inline callout panel.

```mdx
<Callout title="Key Idea">
This section summarizes the important takeaway.
</Callout>
```

### `Figure`

Framed image block with optional caption.

```mdx
<Figure src="/images/example.png" alt="Example diagram" caption="Pipeline overview" />
```

### `CodeBlock`

Pre-styled code block component.

```mdx
<CodeBlock language="ts" code={`const x = 1;`} />
```

### `Copyright` / `copyright`

Reusable article copyright notice.

```mdx
<Copyright />
```

You can also pass custom values:

```mdx
<Copyright year={2026} owner="Sicheng Ouyang" />
```

## Built-in Enhancements (No Extra Component Needed)

- Headings (`h2/h3`) auto-generate anchors for TOC.
- Code fences auto-highlight and infer language when missing.
- Images are zoomable on click.
- Math is enabled with `remark-math` + `rehype-katex`.

## Authoring Notes

- Prefer one idea per section (`##` heading).
- Keep `Sidenote` labels short and stable.
- Use block components as standalone lines (avoid nesting inside inline text where possible).
- If Mermaid fails, check syntax first, then refresh (the runtime is client-side).
