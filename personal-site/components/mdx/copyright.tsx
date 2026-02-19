type CopyrightProps = {
  year?: number;
  owner?: string;
};

export function Copyright({ year = 2026, owner = "Sicheng Ouyang" }: CopyrightProps) {
  return (
    <section className="mt-10 border-t border-gray-200 pt-4 text-xs leading-6 text-gray-500">
      <p className="m-0">Copyright © {year} {owner}. All rights reserved.</p>
      <p className="mt-1">This article may not be reproduced, redistributed, or republished without permission.</p>
    </section>
  );
}

