export function ChatArchitectureDiagram() {
  return (
    <svg
      viewBox="0 0 760 250"
      role="img"
      aria-label="Realtime chat system architecture diagram"
      className="h-auto w-full"
    >
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>

      <g className="diagram-node">
        <rect x="24" y="46" width="130" height="54" rx="6" />
        <text x="89" y="78" textAnchor="middle">Client Gateway</text>

        <rect x="196" y="46" width="130" height="54" rx="6" />
        <text x="261" y="78" textAnchor="middle">Message Ingest</text>

        <rect x="368" y="46" width="130" height="54" rx="6" />
        <text x="433" y="78" textAnchor="middle">Durable Queue</text>

        <rect x="540" y="46" width="130" height="54" rx="6" />
        <text x="605" y="78" textAnchor="middle">Delivery Workers</text>

        <rect x="282" y="154" width="130" height="54" rx="6" />
        <text x="347" y="186" textAnchor="middle">Message Store</text>

        <rect x="454" y="154" width="130" height="54" rx="6" />
        <text x="519" y="186" textAnchor="middle">Ack / Replay</text>
      </g>

      <g className="diagram-edge" markerEnd="url(#arrow)">
        <line x1="154" y1="73" x2="196" y2="73" />
        <line x1="326" y1="73" x2="368" y2="73" />
        <line x1="498" y1="73" x2="540" y2="73" />
        <line x1="261" y1="100" x2="326" y2="154" />
        <line x1="433" y1="100" x2="398" y2="154" />
        <line x1="605" y1="100" x2="519" y2="154" />
        <line x1="412" y1="181" x2="454" y2="181" />
      </g>
    </svg>
  );
}
