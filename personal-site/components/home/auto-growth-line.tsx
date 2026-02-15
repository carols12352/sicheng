"use client";

type GrowthItem = {
  phase: string;
  period: string;
  detail: string;
};

type AutoGrowthLineProps = {
  items: GrowthItem[];
};

export function AutoGrowthLine({ items }: AutoGrowthLineProps) {
  if (items.length === 0) {
    return null;
  }

  const renderList = (duplicate = false) => (
    <ol className="growth-line" aria-hidden={duplicate}>
      {items.map((item, index) => (
        <li
          key={`${item.phase}-${item.period}-${index}-${duplicate ? "dup" : "base"}`}
          className="growth-item"
        >
          <p className="growth-phase">{item.phase}</p>
          <h2 className="mt-1 text-sm font-semibold text-gray-900">{item.period}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">{item.detail}</p>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="growth-line-scroll mt-4">
      <div className="growth-line-track">
        {renderList(false)}
        {renderList(true)}
      </div>
    </div>
  );
}
