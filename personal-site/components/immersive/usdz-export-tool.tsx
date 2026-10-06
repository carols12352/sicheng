"use client";

import { useState } from "react";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import { createCardObject } from "./card-object";

export function UsdzExportTool() {
  const [status, setStatus] = useState("idle");

  async function exportCard() {
    setStatus("exporting");
    const card = createCardObject(0.3);
    try {
      await card.ready;
      const data = await new USDZExporter().parseAsync(card.group, {
        maxTextureSize: 2048,
        includeAnchoringProperties: false,
      });
      const response = await fetch("/immersive/export/save", {
        method: "POST",
        headers: { "content-type": "model/vnd.usdz+zip" },
        body: new Blob([data as BlobPart]),
      });
      setStatus(response.ok ? `saved ${data.byteLength} bytes to public/models/card.usdz` : `save failed: ${response.status}`);
    } catch (error) {
      setStatus(`error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      card.dispose();
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-xl font-semibold text-gray-900">Export card USDZ</h1>
      <p className="mt-3 text-sm text-gray-600">Development only. Writes public/models/card.usdz for the spatial card.</p>
      <button type="button" className="home-btn home-btn-primary mt-6" onClick={exportCard} disabled={status === "exporting"}>
        Export and save
      </button>
      <p className="mt-4 font-mono text-xs text-gray-500" data-testid="export-status">{status}</p>
    </div>
  );
}
